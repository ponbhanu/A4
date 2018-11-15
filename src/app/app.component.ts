import { Component, ViewContainerRef } from '@angular/core';
import { Http, Headers } from '@angular/http';
import * as $ from 'jquery';
import { ToasterService } from 'angular2-toaster';
import {TableModule} from 'primeng/table';
import { HttpService } from './http.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [HttpService]
})
export class AppComponent {
  files: any = [];
  list: any = [];
  radioSelected: any
  width: any;
  isTrue: any;
  id: any;
  selectedFiles: any = [];
  checkedFiles: any = [];
  analyticsData: any = [];
  isCheckBoxClicked: any = false;
  isRadioClicked: any = false;
  disabled: any = true;
  toSearchDate: any;
  fileUploadTab:any = true;
  ocrTab:any;
  mlTab:any;
  taskId:any;
  assignmentTab:any = false;
  feedBackTab: any = false;
  isExecuteMl:any = false;
  execOcrStatus:any = false;
  execMlStatus:any = false;
  constructor(public toasterService: ToasterService, public httpService:HttpService) {
    this.analyticsData = this.getDates();
  }

  onChange(data) {
    if (data && data.target && data.target.files && data.target.files.length) {
      var totalFiles = data.target.files;
      for (var i = 0; i < totalFiles.length; i++) {
        this.files.push({ 'id': Math.random(), 'name': totalFiles[i].name, 'size': totalFiles[i].size, 'image': totalFiles[i], 'number': 1 + i });
      }
    }
  }

  getDates() {
    return [{'no':1,'date':'11-1-2018','count':6},
            {'no':1,'date':'11-2-2018','count':22},
            {'no':1,'date':'11-3-2018','count':44},
            {'no':1,'date':'11-4-2018','count':32},
            {'no':1,'date':'10-11-2018','count':6},
            {'no':1,'date':'10-12-2018','count':22},
            {'no':1,'date':'10-13-2018','count':44},
            {'no':1,'date':'10-14-2018','count':32},
            {'no':1,'date':'10-15-2018','count':6},
            {'no':1,'date':'10-16-2018','count':22},
            {'no':1,'date':'10-17-2018','count':44},
            {'no':1,'date':'10-18-2018','count':32},
            {'no':1,'date':'10-19-2018','count':6},
            {'no':1,'date':'10-20-2018','count':22},
            {'no':1,'date':'10-21-2018','count':44},
            {'no':1,'date':'10-22-2018','count':32}
          ];
  }

  
  onSelectDate() {
    this.analyticsData = this.getDates();
    this.toSearchDate = this.toSearchDate.toLocaleDateString("en-US").replace('/','-').replace('/','-');
    if (this.toSearchDate)
      this.analyticsData = this.analyticsData.filter((item) => item.date == this.toSearchDate);
  }  

  uploadFiles(type: any, i: any, selectedFiles) {
    this.id = i;
    var file = '',
      toFindId = '';
    if (selectedFiles && selectedFiles.length && selectedFiles.length > 0) {
      file = selectedFiles[this.id].image;
      toFindId = selectedFiles[this.id].id;
    } else {
      this.toasterService.pop('error', 'Please select files to upload');
      return;
    }
    if (!this.isRadioClicked) {
      this.toasterService.pop('error', 'Please select the primary file');
      return;
    }

    var headers = getHeaders();
    for (var k = 0; k < this.files.length; k++) {
      if (this.files[k].isPrimary) {
        if (selectedFiles.indexOf(this.files[k]) > -1) {
          headers.append('primary', this.files[k].name);
          k = this.files.length;
        } else {
          this.toasterService.pop('error', 'Primary file must be a selected file');
          return;
        }
      }
    }
    let formData: FormData = new FormData();
    formData.append('file', file);
    localStorage.clear();
    this.httpService.manageHttp('post','http://104.211.60.42:8080/rfp/ic/yankees/upload/', formData, headers)
      .subscribe(response => {
        if (response.resultCode === 'OK') {
          var res = response,
          lotNumber,
          headers = new Headers();
          let formData: FormData = new FormData();
          lotNumber = res.resultObject[0].lotNumber;
          this.httpService.manageHttp('post','http://104.211.60.42:8080/rfp/ic/yankees/store/'+lotNumber, formData, headers)
          .subscribe(response => {
             if (response.resultCode && response.resultCode === 'OK') {
              this.callLoader("bar");
              var rfpId = response.resultObject[0].rfpInputId;
              for (var j = 0; j < this.files.length; j++) {
                if (this.files[j].id === toFindId) {
                  this.files[j].status = 'success';
                }
              }
              var id = this.id + 1;
              if (selectedFiles && selectedFiles.length && selectedFiles.length > 0) {
                if (id < selectedFiles.length) {
                  this.uploadFiles('multiple', id, this.selectedFiles);
                } else {
                  this.isExecuteMl = true;
                  this.selectedFiles = [];
                  this.toasterService.pop('success', 'All files uploaded successfully');
                  this.execOcrStatus = true;
                  this.execOcrStatuses(rfpId)
                  setTimeout(()=>{ 
                    this.execMlStatus = true;
               }, 3000);
                }
              }
            }
          });
        } else if (response.resultCode === 'KO') {
          this.files[this.id].status = 'fail';
          for (var j = 0; j < this.files.length; j++) {
            if (this.files[j].id === toFindId) {
              this.files[j].status = 'fail';
            }
          }
          this.toasterService.pop('error', 'Files uploading has been stopped');
        }
      });
  };


  callLoader(id) {
    var elem = document.getElementById(id),
    width = 1,
    ids = setInterval(frame, 10);
    function frame() {
      if (width >= 100) {
        clearInterval(ids);
      } else {
        width++;
        elem.style.width = width + '%';
        elem.innerHTML = width * 1 + '%';
      }
    };
  }


  onClickRadio(data) {
    this.isRadioClicked = true;
    for (var i = 0; i < this.files.length; i++) {
      if (this.files[i].id === data.id) {
        this.files[i].isPrimary = true;
      }
    }
  }

  onClickCheckBox(file) {
    if (this.selectedFiles.indexOf(file) > -1) {
      this.selectedFiles.splice(file, 1);
    } else {
      this.selectedFiles.push(file);
    }
  }

  cancel() {
    this.files = [];
  }

  manageActions(id, type) {
    if (type === 'delete') {
      this.files = this.files.filter((item) => item.id !== id);
    } 
  }

  uploadAllFiles() {
    this.uploadFiles('multiple', 0, this.selectedFiles);
  }

  execOcrStatuses(rfpId){
    let formData: FormData = new FormData();
    this.httpService.manageHttp('post','http://104.211.60.42:8080/rfp/ic/yankees/split/'+rfpId,'',getHeaders())
    .subscribe(response => {
      if (response.resultCode && response.resultCode === 'OK') {
        //this.callLoader("task-bar");
        this.httpService.manageHttp('post','http://104.211.60.42:8080/rfp/ic/yankees/ocr/'+rfpId,'', getHeaders())
        .subscribe(response => {
          if (response.resultCode && response.resultCode === 'OK') {
            //this.callLoader("metrics-bar");
          
            this.httpService.manageHttp('post','http://104.211.60.42:8080/rfp/ic/yankees/model/'+rfpId,'', getHeaders())
            .subscribe(response => {
              if (response.resultCode && response.resultCode === 'OK') {
                this.httpService.manageHttp('post','http://104.211.60.42:8080/rfp/ic/yankees/xls/'+rfpId,'', getHeaders())
                .subscribe(response => {
                  if (response.resultCode && response.resultCode === 'OK') {
                    this.callLoader("ml-bar");
                    this.toasterService.pop('success', 'ocr is completed');
                  } else {
                    this.toasterService.pop('error', 'Status failed at CSV');
                  }
                });
               
              } else {
                this.toasterService.pop('error', 'Status failed at CSV');
              }
            });
        } else {
          this.toasterService.pop('error', 'Status failed at RFP');
        }
      });
      } else {
        this.taskId = '';
        this.toasterService.pop('error', 'Status failed at getting Split');
      }
    });
  };

  closeModal() {
    this.analyticsData = this.getDates();
    this.toSearchDate = '';
  }

  uploadRefFile(data) {
    if (data && data.target && data.target.files && data.target.files.length && data.target.files.length > 0) {
      var refFile = data.target.files;
      if (refFile) {
        this.disabled = true;
      } else {
        this.disabled = false;
      }
    }
  };
  onClickTabs(tabId) {
    this.emptyFiles();
    var tabsArr = ['fileUploadTab','ocrTab','mlTab'],
    index = tabsArr.indexOf(tabId);
    tabsArr.splice(index,1);
    for (var i = 0;i< tabsArr.length;i++){
      $('#'+tabsArr[i]).removeClass('tabsBgColor');
    };
    $('#'+tabId).addClass('tabsBgColor');
    if (tabId === 'fileUploadTab') {
      this.assignmentTab = false;
      this.fileUploadTab = true;
      this.ocrTab = false;
      this.mlTab = false;
      this.feedBackTab = false;
    } else if (tabId === 'ocrTab') {
      this.assignmentTab = false;
      this.fileUploadTab = false;
      this.ocrTab = true;
      this.mlTab = false;
      this.feedBackTab = false;
    } else if (tabId === 'mlTab') {
      this.assignmentTab = false;
      this.fileUploadTab = false;
      this.ocrTab = false;
      this.mlTab = true;
      this.feedBackTab = false;
    } else if (tabId === 'assignmentTab') {
      this.assignmentTab = true;
      this.fileUploadTab = false;
      this.ocrTab = false;
      this.mlTab = false;
      this.feedBackTab = false;
    } else if (tabId === 'feedBackTab') {
      this.assignmentTab = false;
      this.fileUploadTab = false;
      this.ocrTab = false;
      this.mlTab = false;
      this.feedBackTab = true;
    }
  };

  emptyFiles(){
    this.files = [];
    this.list =[];
    this.selectedFiles = [];
  };
}

export function getHeaders() {
  var headers = new Headers();
  return headers;
}

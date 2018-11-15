import { Component } from '@angular/core';
import { HttpService } from '../http.service';
import { getHeaders } from '../app.component';
import { ToasterService } from 'angular2-toaster';

@Component({
  selector: 'ocr-tab',
  templateUrl: './ocr.component.html',
  styleUrls: ['./ocr.component.css']
})
export class OcrComponent {
  taskId:any;
  rfpInputId : any;
  ocrStatusList: any = [{'status':'split','success':false},{'status':'ocr','success':false},{'status':'rfpmodel','success':false},{'status':'xml','success':false},{'status':'xls','success':false},{'status':'level11','success':false},{'status':'csv','success':false}];
  mlStatusList: any = [{'status':'clauseId','success':false},{'status':'status','success':false}];
 
  constructor(public httpService:HttpService,public toasterService: ToasterService) {
    this.rfpInputId =  localStorage.getItem('rfpId');
    if (this.rfpInputId) {
      this.split();
    }
  
    
  }

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

  split(){
    let formData: FormData = new FormData();
    this.httpService.manageHttp('post','http://104.211.60.42:8080/rfp/ic/yankees/split/'+this.rfpInputId,'', getHeaders())
    .subscribe(response => {
      if (response.resultCode && response.resultCode === 'OK') {
        this.ocrStatusList[0].success = true;
        this.httpService.manageHttp('post','http://104.211.60.42:8080/rfp/ic/yankees/ocr/'+this.rfpInputId,'', getHeaders())
        .subscribe(response => {
          if (response.resultCode && response.resultCode === 'OK') {
            this.ocrStatusList[1].success = true;
            this.httpService.manageHttp('post','http://104.211.60.42:8080/rfp/ic/yankees/model/'+this.rfpInputId,'', getHeaders())
            .subscribe(response => {
              if (response.resultCode && response.resultCode === 'OK') {
                this.ocrStatusList[2].success = true;
                this.httpService.manageHttp('post','http://104.211.60.42:8080/rfp/ic/yankees/xls/'+this.rfpInputId,'', getHeaders())
                .subscribe(response => {
                  if (response.resultCode && response.resultCode === 'OK') {
                    this.ocrStatusList[3].success = true;
                   this.httpService.manageHttp('post','http://104.211.60.42:8080/rfp/ic/yankees/csv/'+this.rfpInputId,'', getHeaders())
                    .subscribe(response => {
                      if (response.resultCode && response.resultCode === 'OK') {
                        this.ocrStatusList[4].success = true;
                        this.httpService.manageHttp('post','http://104.211.60.42:8080/rfp/ic/yankees/mv/'+this.rfpInputId,'', getHeaders())
                        .subscribe(response => {
                          if (response.resultCode && response.resultCode === 'OK') {
                            this.ocrStatusList[5].success = true;
                            this.callLoader("ocr-bar");
                            this.asyncMlPredict();
                          } else {
                            this.ocrStatusList[5].success = false;
                            this.toasterService.pop('error', 'Status failed at csv');
                          }
                        });
                        
                      } else {
                        this.ocrStatusList[4].success = false;
                        this.toasterService.pop('error', 'Status failed at xls');
                      }
                    });
                    
                  } else {
                    this.ocrStatusList[3].success = false;
                    this.toasterService.pop('error', 'Status failed at xml');
                  }
                });
              } else {
                this.ocrStatusList[2].success = false;
                this.toasterService.pop('error', 'Status failed at rfpModel');
              }
            });
        } else {
          this.ocrStatusList[1].success = false;
          this.toasterService.pop('error', 'Status failed at OCR');
        }
      });
      } else {
        this.taskId = '';
        this.ocrStatusList[0].success = false;
        this.toasterService.pop('error', 'Status failed at getting Split');
      }
    });
  };





  asyncMlPredict(){
    let formData: FormData = new FormData();
    this.httpService.manageHttp('post','http://localhost:3000/api/sendLotNumber/'+12,'', getHeaders())
    .subscribe(response => {
      if (response.resultCode && response.resultCode === 'OK') {
        this.mlStatusList[0].success = true;
        this.httpService.manageHttp('post','http://localhost:3000/api/sendLotNumber/'+12,'', getHeaders())
        .subscribe(response => {
          if (response.resultCode && response.resultCode === 'OK') {
            this.mlStatusList[1].success = true;
            this.httpService.manageHttp('post','http://localhost:3000/api/sendLotNumber/'+12,'', getHeaders())
            .subscribe(response => {
              if (response.resultCode && response.resultCode === 'OK') {
                this.mlStatusList[2].success = true;
                this.callLoader("ml-bar");
              } else {
                this.mlStatusList[0].success = true;
                this.toasterService.pop('error', 'Status failed at Status');
              }
            });
        } else {
          this.mlStatusList[0].success = true;
          this.toasterService.pop('error', 'Status failed at Metrics');
        }
      });
      } else {
        this.mlStatusList[0].success = false;
        this.taskId = '';
        this.toasterService.pop('error', 'Status failed at getting TaskId');
      }
    });
  }
}

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
  constructor(public httpService:HttpService,public toasterService: ToasterService) {
      this.asyncPredict();
    
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

  asyncPredict(){
    let formData: FormData = new FormData();
    this.httpService.manageHttp('post','http://localhost:3000/api/asyncpredict', formData, getHeaders())
    .subscribe(response => {
      if (response.resultCode && response.resultCode === 'OK') {
        //this.callLoader("task-bar");
        this.httpService.manageHttp('get','http://localhost:3000/api/'+this.taskId+'/metrics','', getHeaders())
        .subscribe(response => {
          if (response.resultCode && response.resultCode === 'OK') {
            //this.callLoader("metrics-bar");
          
            this.httpService.manageHttp('get','http://localhost:3000/api/'+this.taskId+'/status','', getHeaders())
            .subscribe(response => {
              if (response.resultCode && response.resultCode === 'OK') {
                this.callLoader("ml-bar");
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
}

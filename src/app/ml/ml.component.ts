import { Component,Input} from '@angular/core';
import { HttpService } from '../http.service';
import { getHeaders } from '../app.component';

@Component({
  selector: 'ml-tab',
  templateUrl: './ml.component.html',
  styleUrls: ['./ml.component.css']
})
export class MlComponent {
  taskId:any;
  constructor(public httpService:HttpService) {
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
        this.taskId = response.resultObj.taskId;
        this.callLoader("task-bar");
        this.httpService.manageHttp('get','http://localhost:3000/api/'+this.taskId+'/metrics','', getHeaders())
        .subscribe(response => {
          if (response.resultCode && response.resultCode === 'OK') {
            this.taskId = response.resultObj.taskId;
            this.callLoader("metrics-bar");
          } else {

          }
            this.httpService.manageHttp('get','http://localhost:3000/api/'+this.taskId+'/status','', getHeaders())
            .subscribe(response => {
              if (response.resultCode && response.resultCode === 'OK') {
                this.taskId = response.resultObj.taskId;
                this.callLoader("status-bar");
              } else {

              }
            });
        });
      } else {
        this.taskId = '';
      }
    });
  };
}

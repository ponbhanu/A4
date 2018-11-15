import { Component,Input, OnChanges} from '@angular/core';
import { HttpService } from '../http.service';
import { getHeaders } from '../app.component';
import { ToasterService } from 'angular2-toaster';

@Component({
  selector: 'ml-tab',
  templateUrl: './ml.component.html',
  styleUrls: ['./ml.component.css'],
  inputs:['inputData']
})
export class MlComponent implements OnChanges{
  taskId:any;
  @Input() inputData:any;
  mlStatusList: any = [{'status':'clauseId','success':false},{'status':'status','success':false}];
  
  constructor(public httpService:HttpService,public toasterService: ToasterService) {
    this.asyncMlPredict();
  }

  ngOnChanges(changes) {
    console.log(changes);
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
  };
}

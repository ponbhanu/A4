import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()

export class HttpService {
  headers:any;
  toRunMethod:any;
  constructor(public http: Http) {}
  // manage http calls with login token
  manageHttp(method: any, url: any, body: any, head) {
    if (method === 'get') {
      this.toRunMethod = this.http.get(url, { headers: head });
    } else if (method === 'post') {
      this.toRunMethod = this.http.post(url, body, { headers: head });
    } else if (method === 'put') {
      this.toRunMethod = this.http.put(url, body, { headers: head });
    } else if (method === 'delete') {
      this.toRunMethod = this.http.delete(url, { headers: head });
    }
    return this.toRunMethod.map((response: Response) => {
      if (response  && response.json()) {
        return response.json();
      }
    }, (error) => {
      console.log(error);
    });
  };
}


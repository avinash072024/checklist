import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { SessionService } from '../session/session.service';
import { Constants } from '../../models/constants';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  http = inject(HttpClient);
  sessionService = inject(SessionService);

  createChecklist(payload: any): Observable<any> {
    // return this.http.post(`${environment.apiUrl}/checklists/`, payload);
    return this.http.post(`${environment.apiUrl}/checklists/`, payload, {
      headers: {
        Authorization: `Bearer ${this.sessionService.getCookie(Constants.token)}`
      }
    });
  }

  updateChecklist(data: any): Observable<any> {
    debugger;
    return this.http.put(`${environment.apiUrl}/checklists/${data?.id}`, data, {
      headers: {
        Authorization: `Bearer ${this.sessionService.getCookie(Constants.token)}`
      }
    });
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  private getAuthHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.sessionService.getCookie(Constants.token) || ''}`
      })
    };
  }

  createChecklist(payload: any): Observable<any> {
    // return this.http.post(`${environment.apiUrl}/checklists/`, payload);
    return this.http.post(`${environment.apiUrl}/checklists/`, payload, this.getAuthHeaders());
  }

  // updateChecklist(data: any): Observable<any> {
  //   debugger;
  //   return this.http.put(`${environment.apiUrl}/checklists/${data?.id}`, data, {
  //     headers: {
  //       Authorization: `Bearer ${this.sessionService.getCookie(Constants.token)}`
  //     }
  //   });
  // }

  // Update checklist API call
  updateChecklist(id: string, payload: { title?: string; listItems?: any[]; isFreeze?: boolean }): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/checklists/${id}`, payload, this.getAuthHeaders());
  }

  addItemToChecklist(checklistId: string, text: string): Observable<any> {
    debugger;
    return this.http.post<any>(
      `${environment.apiUrl}/checklists/${checklistId}/items`,
      { text },
      this.getAuthHeaders()
    );
  }
}

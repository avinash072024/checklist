import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { SessionService } from '../session/session.service';
import { Constants } from '../../models/constants';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../models/user.model';

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

  // Update checklist API call
  updateChecklist(id: string, payload: { title?: string; listItems?: any[]; isFreeze?: boolean }): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/checklists/${id}`, payload, this.getAuthHeaders());
  }

  addItemToChecklist(checklistId: string, text: string): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/checklists/${checklistId}/items`,
      { text },
      this.getAuthHeaders()
    );
  }

  getChecklistById(checklistId: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/${checklistId}`,
      this.getAuthHeaders()
    );
  }

  getChecklists(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/all`,
      this.getAuthHeaders()
    );
  }

  deleteChecklist(checklistId: string): Observable<any> {
    return this.http.delete<any>(
      `${environment.apiUrl}/checklists/${checklistId}`,
      this.getAuthHeaders()
    );
  }

  deleteChecklistItem(checklistId: string, itemId: string): Observable<any> {
    return this.http.delete<any>(
      `${environment.apiUrl}/checklists/${checklistId}/items/${itemId}`,
      this.getAuthHeaders()
    );
  }

  toggleItemComplete(checklistId: string, itemId: string, completed: boolean): Observable<any> {
    return this.http.patch<any>(
      `${environment.apiUrl}/checklists/${checklistId}/items/${itemId}/complete`,
      { completed },
      this.getAuthHeaders()
    );
  }

  freezeChecklist(checklistId: string, isFreeze: boolean): Observable<any> {
    return this.http.patch<any>(
      `${environment.apiUrl}/checklists/${checklistId}/freeze`,
      { isFreeze },
      this.getAuthHeaders()
    );
  }

  getChecklistsByMe(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/my-lists`,
      this.getAuthHeaders()
    );
  }

  getChecklistsByOther(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/other-lists`,
      this.getAuthHeaders()
    );
  }

  getNameOfListCreated(data: any): string {
    const token = this.sessionService.getCookie(Constants.token);
    let userDetails: any;
    let userName: string;

    if (token) {
      const decodedToken = jwtDecode<User>(token);
      userDetails = decodedToken;
    }

    userName = userDetails?.id == data?.id ? 'You' : data?.fullname;
    return userName;
  }
}

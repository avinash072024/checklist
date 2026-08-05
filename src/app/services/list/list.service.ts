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

  // private getAuthHeaders() {
  //   return {
  //     headers: new HttpHeaders({
  //       Authorization: `Bearer ${this.sessionService.getCookie(Constants.token) || ''}`
  //     })
  //   };
  // }

  createChecklist(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/checklists/`, payload, this.sessionService.getAuthHeaders());
  }

  // Update checklist API call
  updateChecklist(id: string, payload: { title?: string; listItems?: any[]; isFreeze?: boolean }): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/checklists/${id}`, payload, this.sessionService.getAuthHeaders());
  }

  addItemToChecklist(checklistId: string, text: string): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/checklists/${checklistId}/items`,
      { text },
      this.sessionService.getAuthHeaders()
    );
  }

  getChecklistById(checklistId: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/${checklistId}`,
      this.sessionService.getAuthHeaders()
    );
  }

  getChecklists(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/all`,
      this.sessionService.getAuthHeaders()
    );
  }

  deleteChecklist(checklistId: string): Observable<any> {
    return this.http.delete<any>(
      `${environment.apiUrl}/checklists/${checklistId}`,
      this.sessionService.getAuthHeaders()
    );
  }

  deleteChecklistItem(checklistId: string, itemId: string): Observable<any> {
    return this.http.delete<any>(
      `${environment.apiUrl}/checklists/${checklistId}/items/${itemId}`,
      this.sessionService.getAuthHeaders()
    );
  }

  toggleItemComplete(checklistId: string, itemId: string, completed: boolean): Observable<any> {
    return this.http.patch<any>(
      `${environment.apiUrl}/checklists/${checklistId}/items/${itemId}/complete`,
      { completed },
      this.sessionService.getAuthHeaders()
    );
  }

  freezeChecklist(checklistId: string, isFreeze: boolean): Observable<any> {
    return this.http.patch<any>(
      `${environment.apiUrl}/checklists/${checklistId}/freeze`,
      { isFreeze },
      this.sessionService.getAuthHeaders()
    );
  }

  getChecklistsByMe(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/my-lists`,
      this.sessionService.getAuthHeaders()
    );
  }

  getChecklistsByOther(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/other-lists`,
      this.sessionService.getAuthHeaders()
    );
  }

  getPrivateChecklists(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/my-private-lists`,
      this.sessionService.getAuthHeaders()
    );
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/dashboard-stats`,
      this.sessionService.getAuthHeaders()
    );
  }

  getNameOfListCreated(data: any): string {
    if (!data) return '';

    const token = this.sessionService.getCookie(Constants.token);
    let currentUserId: string | null = null;

    if (token) {
      try {
        const decodedToken = jwtDecode<any>(token);
        currentUserId = decodedToken?.id || decodedToken?._id || decodedToken?.userId;
      } catch (e) {
        currentUserId = null;
      }
    }

    const dataUserId = typeof data === 'object' ? (data._id || data.id) : data;

    if (currentUserId && dataUserId && currentUserId.toString() === dataUserId.toString()) {
      return 'You';
    }

    if (typeof data === 'object' && data !== null) {
      if (data.fullname && data.fullname.trim()) {
        return data.fullname.trim();
      }
      const fullNameFromNames = `${data.firstName || ''} ${data.lastName || ''}`.trim();
      if (fullNameFromNames) {
        return fullNameFromNames;
      }
      if (data.username) {
        return data.username;
      }
      if (data.name) {
        return data.name;
      }
    }

    return '';
  }
}

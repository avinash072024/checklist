import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from '../session/session.service';
import { Constants } from '../../models/constants';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  http = inject(HttpClient);
  sessionService = inject(SessionService);

  createChecklist(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/checklists/`, payload);
  }

  addItemToChecklist(checklistId: string, text: string): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/checklists/${checklistId}/items`,
      { text }
    );
  }

  addItemsToChecklist(checklistId: string, items: string[]): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/checklists/${checklistId}/items/bulk`,
      { items }
    );
  }

  getChecklistById(checklistId: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/${checklistId}`
    );
  }

  getChecklists(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/all`
    );
  }

  deleteChecklist(checklistId: string): Observable<any> {
    return this.http.delete<any>(
      `${environment.apiUrl}/checklists/${checklistId}`
    );
  }

  deleteChecklistItem(checklistId: string, itemId: string): Observable<any> {
    return this.http.delete<any>(
      `${environment.apiUrl}/checklists/${checklistId}/items/${itemId}`
    );
  }

  reorderChecklistItems(checklistId: string, orderedIds: string[]): Observable<any> {
    return this.http.patch<any>(
      `${environment.apiUrl}/checklists/${checklistId}/reorder`,
      { orderedIds }
    );
  }

  toggleItemComplete(checklistId: string, itemId: string, completed: boolean): Observable<any> {
    return this.http.patch<any>(
      `${environment.apiUrl}/checklists/${checklistId}/items/${itemId}/complete`,
      { completed }
    );
  }

  freezeChecklist(checklistId: string, isFreeze: boolean): Observable<any> {
    return this.http.patch<any>(
      `${environment.apiUrl}/checklists/${checklistId}/freeze`,
      { isFreeze }
    );
  }

  getChecklistsByMe(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/my-lists`
    );
  }

  getChecklistsByOther(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/other-lists`
    );
  }

  getSharedChecklists(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/shared-with-me`
    );
  }

  getPrivateChecklists(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/my-private-lists`
    );
  }

  sharePrivateChecklist(checklistId: string, userIds: string[]): Observable<any> {
    return this.http.put<any>(
      `${environment.apiUrl}/checklists/${checklistId}/share`,
      { userIds }
    );
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/checklists/dashboard-stats`
    );
  }

  getUserList(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/auth/users`
    );
  }

  downloadChecklistPdf(checklistId: string, clientTime?: string): Observable<Blob> {
    const token = this.sessionService.getCookie(Constants.token) || '';

    let params = new HttpParams();
    if (clientTime) {
      params = params.set('clientTime', clientTime);
    }

    return this.http.get(
      `${environment.apiUrl}/checklists/${checklistId}/pdf`,
      {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        params: params,
        responseType: 'blob'
      }
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
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.socketUrl || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      upgrade: false
    });
  }

  // Listen to a specific event and return an Observable
  onEvent(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });

      return () => {
        this.socket.off(eventName);
      };
    });
  }

  // Helper stream to listen to all checklist mutations
  onChecklistChange(): Observable<any> {
    return new Observable((subscriber) => {
      const events = [
        'checklist:created',
        'checklist:updated',
        'checklist:deleted',
        'checklist:item-added',
        'checklist:item-deleted',
        'checklist:item-toggled',
        'checklist:frozen',
        'checklist:reordered'
      ];

      const handlers = events.map(event => {
        const handler = (data: any) => subscriber.next({ event, ...data });
        this.socket.on(event, handler);
        return { event, handler };
      });

      return () => {
        handlers.forEach(({ event, handler }) => {
          this.socket.off(event, handler);
        });
      };
    });
  }

  // Helper stream to listen to all user mutations
  onUserChange(): Observable<any> {
    return new Observable((subscriber) => {
      const events = [
        'user:created',
        'user:updated',
        'user:verified',
        'user:deleted'
      ];

      const handlers = events.map(event => {
        const handler = (data: any) => subscriber.next({ event, ...data });
        this.socket.on(event, handler);
        return { event, handler };
      });

      return () => {
        handlers.forEach(({ event, handler }) => {
          this.socket.off(event, handler);
        });
      };
    });
  }
}
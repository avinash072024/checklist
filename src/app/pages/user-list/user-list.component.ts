import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListService } from '../../services/list/list.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket/socket.service';
import { AvatarService } from '../../services/avatar/avatar.service';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  users = signal<any[]>([]);
  isLoading = signal(false);

  private readonly listService = inject(ListService);
  private readonly toastr = inject(ToastrService);
  avatarService = inject(AvatarService);

  socketService = inject(SocketService);

  private socketSub!: Subscription;

  ngOnInit(): void {
    this.loadUsers(true);

    this.socketSub = this.socketService.onChecklistChange().subscribe(() => {
      this.loadUsers(false);
    });
  }

  loadUsers(showLoader: boolean): void {
    this.isLoading.set(showLoader);

    this.listService.getUserList().subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.users.set(Array.isArray(res.data) ? res.data : []);
        } else {
          this.users.set([]);
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.toastr.error(err?.error?.message || 'Unable to load users.', 'Error');
      }
    });
  }
}

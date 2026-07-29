import { Component, inject, OnInit, signal } from '@angular/core';
import { ListService } from '../../services/list/list.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  dashboard = signal({
    totalLists: 0,
    myLists: 0,
    otherLists: 0
  });

  totalListItems: any;
  totalListItemsByMe: any;
  totalListItemsByOther: any;

  listService = inject(ListService);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);

  ngOnInit(): void {
    // this.getLists();
    // this.getListsByMe();
    // this.getListsByOther();
    this.getDashboardData();
  }

  getDashboardData(): void {
    this.spinner.show();

    forkJoin({
      totalLists: this.listService.getChecklists(),
      myLists: this.listService.getChecklistsByMe(),
      otherLists: this.listService.getChecklistsByOther()
    }).subscribe({
      next: ({ totalLists, myLists, otherLists }) => {

        this.dashboard.set({
          totalLists: totalLists?.success ? (totalLists.count || 0) : 0,
          myLists: myLists?.success ? (myLists.count || 0) : 0,
          otherLists: otherLists?.success ? (otherLists.count || 0) : 0
        });

        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error(err?.message || 'Something went wrong.');
      }
    });
  }

  // getLists(): void {
  //   this.spinner.show();
  //   this.listService.getChecklists().subscribe({
  //     next: (res: any) => {
  //       if (res?.success) {
  //         this.totalListItems = res?.count || 0;
  //         console.log('this.listItems', this.totalListItems)
  //         this.spinner.hide();
  //       } else {
  //         this.spinner.hide();
  //         this.toastr.error(res?.message);
  //       }
  //     },
  //     error: (err) => {
  //       this.spinner.hide();
  //       this.toastr.error(err?.message);
  //     }
  //   })
  // }

  // getListsByMe(): void {
  //   this.spinner.show();
  //   this.listService.getChecklistsByMe().subscribe({
  //     next: (res: any) => {
  //       if (res?.success) {
  //         this.totalListItemsByMe = res?.count || 0;
  //         console.log('this.listItems', this.totalListItemsByMe)
  //         this.spinner.hide();
  //       } else {
  //         this.spinner.hide();
  //         this.toastr.error(res?.message);
  //       }
  //     },
  //     error: (err) => {
  //       this.spinner.hide();
  //       this.toastr.error(err?.message);
  //     }
  //   })
  // }

  // getListsByOther(): void {
  //   this.spinner.show();
  //   this.listService.getChecklistsByOther().subscribe({
  //     next: (res: any) => {
  //       if (res?.success) {
  //         this.totalListItemsByOther = res?.count || 0;
  //         console.log('this.listItems', this.totalListItemsByOther);
  //         this.spinner.hide();
  //       } else {
  //         this.spinner.hide();
  //         this.toastr.error(res?.message);
  //       }
  //     },
  //     error: (err) => {
  //       this.spinner.hide();
  //       this.toastr.error(err?.message);
  //     }
  //   })
  // }
}
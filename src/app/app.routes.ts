import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Constants } from './models/constants';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
        title: `${Constants?.appName} - Login`
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
        title: `${Constants?.appName} - Register`
    },
    {
        path: '',
        loadComponent: () => import('./pages/layout/layout.component').then(m => m.LayoutComponent),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
                title: `${Constants?.appName} - Dashboard`
            },
            {
                path: 'create-list',
                loadComponent: () => import('./pages/create-list/create-list.component').then(m => m.CreateListComponent),
                title: `${Constants?.appName} - Create List`
            },
            {
                path: 'lists',
                loadComponent: () => import('./pages/lists/lists.component').then(m => m.ListsComponent),
                title: `${Constants?.appName} - Lists`
            },
            {
                path: 'view-checklist/:id',
                loadComponent: () => import('./pages/view-checklist/view-checklist.component').then(m => m.ViewChecklistComponent),
                title: `${Constants?.appName} - View Checklist`
            },
            {
                path: 'lists/my-lists',
                loadComponent: () => import('./pages/my-lists/my-lists.component').then(m => m.MyListsComponent),
                title: `${Constants?.appName} - My Lists`
            },
            {
                path: 'lists/other-lists',
                loadComponent: () => import('./pages/other-lists/other-lists.component').then(m => m.OtherListsComponent),
                title: `${Constants?.appName} - Other Lists`
            },
            // page under construction
            {
                path: 'my-profile',
                loadComponent: () => import('./pages/page-under-construction/page-under-construction.component').then(m => m.PageUnderConstructionComponent),
                title: `${Constants?.appName} - My Profile`
            },
            {
                path: 'change-password',
                loadComponent: () => import('./pages/page-under-construction/page-under-construction.component').then(m => m.PageUnderConstructionComponent),
                title: `${Constants?.appName} - Change Password`
            }
        ],
        canActivate: [authGuard]
    },
    {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
        title: '404 - Page Not Found'
    }
];

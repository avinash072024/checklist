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

import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
        title: 'Checklist - Login'
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
        title: 'Checklist - Register'
    },
    {
        path: '',
        loadComponent: () => import('./pages/layout/layout.component').then(m => m.LayoutComponent),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
                title: 'Checklist - Dashboard'
            },
            {
                path: 'create-list',
                loadComponent: () => import('./pages/create-list/create-list.component').then(m => m.CreateListComponent),
                title: 'Checklist - List'
            },
            {
                path: 'view-checklist/:id',
                loadComponent: () => import('./pages/view-checklist/view-checklist.component').then(m => m.ViewChecklistComponent),
                title: 'Checklist - View Checklist'
            }
        ],
        canActivate: [authGuard]
    },
    // {
    //     path: 'todo',
    //     loadComponent: () => import('./pages/todo/todo.component').then(m => m.TodoComponent),
    //     canActivate: [authGuard],
    //     title: 'Checklist - List'
    // },
    {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
        title: '404 - Page Not Found'
    }
];

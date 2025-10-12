import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { adminRoutes } from './admin/admin.routes';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  ...adminRoutes,
  { path: '**', redirectTo: '' },
];

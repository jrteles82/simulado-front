import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SimuladoComponent } from './simulado/simulado.component';
import { adminRoutes } from './admin/admin.routes';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'simulado', component: SimuladoComponent },
  ...adminRoutes,
  { path: '**', redirectTo: '' },
];

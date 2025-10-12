import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SimuladoComponent } from './simulado/simulado.component';
import { CandidateAreaComponent } from './candidate-area/candidate-area.component';
import { adminRoutes } from './admin/admin.routes';
import { requireAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'simulado', component: SimuladoComponent },
  { path: 'area-do-candidato', component: CandidateAreaComponent, canActivate: [requireAuthGuard] },
  ...adminRoutes,
  { path: '**', redirectTo: '' },
];

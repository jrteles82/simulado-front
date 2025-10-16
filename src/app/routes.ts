import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SimuladoComponent } from './simulado/simulado.component';
import { SimuladosCatalogComponent } from './simulados-catalog/simulados-catalog.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CheckoutSuccessComponent } from './checkout/checkout-success.component';
import { CandidateAreaComponent } from './candidate-area/candidate-area.component';
import { adminRoutes } from './admin/admin.routes';
import { requireAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'simulados', component: SimuladosCatalogComponent },
  { path: 'simulado', component: SimuladoComponent, canActivate: [requireAuthGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [requireAuthGuard] },
  { path: 'checkout/success', component: CheckoutSuccessComponent, canActivate: [requireAuthGuard] },
  { path: 'area-do-candidato', component: CandidateAreaComponent, canActivate: [requireAuthGuard] },
  ...adminRoutes,
  { path: '**', redirectTo: '' },
];

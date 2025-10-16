// src/app/checkout/checkout.component.ts
import { Component, OnInit } from '@angular/core';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { PlansService, Plan, CheckoutService } from '../services/plans.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  template: `
  <div>
    <h2>Planos</h2>
    <div *ngFor="let p of plans">
      <div>{{ p.name }} - {{ (p.priceCents/100) | currency:p.currency }}</div>
      <button (click)="buy(p)">Assinar</button>
    </div>
    <div id="wallet_container" style="margin-top:16px;"></div>
  </div>
  `
})
export class CheckoutComponent implements OnInit {
  plans: Plan[] = [];
  bricks: any;

  constructor(private plansSvc: PlansService, private ck: CheckoutService) {}

  async ngOnInit() {
    this.plansSvc.list().subscribe(p => (this.plans = p));
    const mp: any = await loadMercadoPago();
    await mp.initialize({ locale: 'pt-BR' });
    this.bricks = await mp.bricks();
  }

  buy(p: Plan) {
    this.ck.start(p.slug).subscribe(async ({ preferenceId }) => {
      const settings = {
        initialization: { preferenceId },
        customization: { texts: { valueProp: 'smart_option' } },
        callbacks: {
          onReady: () => {},
          onError: (err: any) => { console.error(err); },
        }
      };
      await this.bricks.create('wallet', 'wallet_container', settings);
    });
  }
}

// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { CatalogoComponent } from './catalogo/catalogo';      // <-- sigue igual (si tu archivo es catalogo.ts)
import { CarritoComponent } from './carrito/carrito';         // <-- CAMBIO: ya no .carrito.component

export const routes: Routes = [
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'carrito',  component: CarritoComponent },
  { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
  { path: '**', redirectTo: 'catalogo' }
];

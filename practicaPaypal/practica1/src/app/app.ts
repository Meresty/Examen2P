import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CarritoIndicadorComponent } from './carrito/carrito-indicador.component'; // 👈 path correcto

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CarritoIndicadorComponent, // 👈 ahora sí existe
  ],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="nav-logo">°❀⋆.ೃ࿔*:･°❀⋆.ೃ࿔*:･</a>
        <div class="nav-links">
          <a routerLink="/catalogo" routerLinkActive="active" class="nav-link">Catálogo</a>
          <a routerLink="/carrito" routerLinkActive="active" class="nav-link">Carrito</a>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-carrito-indicador></app-carrito-indicador>
  `,
})
export class AppComponent {}

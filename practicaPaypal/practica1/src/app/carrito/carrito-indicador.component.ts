import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-carrito-indicador',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="indicador-carrito" *ngIf="totalItems > 0">
      <a routerLink="/carrito" class="contador-carrito">
        {{ totalItems }} items
      </a>
    </div>
  `,
  styles: [`
    .indicador-carrito { position: fixed; top: 20px; right: 20px; z-index: 1000; }
    .contador-carrito { background: #111; color: #fff; padding: .5rem .9rem; border-radius: 16px; text-decoration: none; }
  `]
})
export class CarritoIndicadorComponent implements OnInit {
  totalItems = 0;
  constructor(private carritoService: CarritoService) {}
  ngOnInit(): void {
    this.carritoService.cart$.subscribe(() => {
      this.totalItems = this.carritoService.obtenerTotalItems();
    });
  }
}
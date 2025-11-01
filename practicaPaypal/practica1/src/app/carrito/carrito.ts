// src/app/carrito/carrito.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CarritoService, CartItem } from '../services/carrito.service';

declare const paypal: any; 

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule], // 👈 agregado RouterModule
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.css'],
})
export class CarritoComponent implements OnInit, AfterViewInit {
  cartItems: CartItem[] = [];
  totalPrecio = 0;

  private readonly apiBase = 'http://localhost:4000';
  private isSubmitting = false;

  public trackByProductId = (_index: number, item: CartItem) => item.product.id;

  constructor(
    public carritoService: CarritoService,
    public http: HttpClient
  ) {}

  ngOnInit(): void {
    this.carritoService.cart$.subscribe((items) => {
      this.cartItems = items;
      this.totalPrecio = this.carritoService.obtenerTotalPrecio();

      if (typeof paypal !== 'undefined') {
        this.renderizarBotonPayPal();
      }
    });
  }

  ngAfterViewInit(): void {
    this.cargarPayPalSDK().then(() => this.renderizarBotonPayPal());
  }

  actualizar(item: CartItem, nuevaCantidad: number): void {
    this.carritoService.actualizarCantidad(item.product.id, nuevaCantidad);
  }

  quitar(item: CartItem): void {
    this.carritoService.removerDelCarrito(item.product.id);
  }

  vaciar(): void {
    this.carritoService.limpiarCarrito();
  }

  getTotalItems(): number {
    return this.cartItems.reduce((sum, i) => sum + i.quantity, 0);
  }

  exportarXML(): void {
    if (this.cartItems.length === 0) {
      alert('El carrito está vacío. Añade productos antes de generar la factura.');
      return;
    }
    this.carritoService.exportarXML();
  }

  private cargarPayPalSDK(): Promise<void> {
    return new Promise((resolve) => {
      const existing = document.getElementById('paypal-sdk');
      if (existing) return resolve();

      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      script.src =
        'https://www.paypal.com/sdk/js?client-id=AVqcQM2wfBQ-nCGLGpH8NZXxRXTIy1TlKs5jBAzVz9Y6_rfbo0rpBez5hAQOpyf5j1eWYnKeH4j1V07g&currency=MXN';
      script.onload = () => resolve();
      script.onerror = () => {
        console.error('No se pudo cargar el SDK de PayPal');
        resolve();
      };
      document.body.appendChild(script);
    });
  }

  private renderizarBotonPayPal(): void {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;

  
    if (this.cartItems.length === 0 || this.totalPrecio <= 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = '';

    if (typeof paypal === 'undefined' || !paypal?.Buttons) {
      console.warn('SDK de PayPal aún no disponible');
      return;
    }

    paypal.Buttons({
      style: {
        color: 'gold',
        shape: 'pill',
        label: 'pay',
        layout: 'vertical',
      },


      createOrder: (_: unknown, actions: any) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: { value: this.totalPrecio.toFixed(2) },
              description: 'Compra en Panadería',
            },
          ],
        });
      },
      onApprove: async (_: unknown, actions: any) => {
  if (this.isSubmitting) return;
  this.isSubmitting = true;

  try {
    const details = await actions.order.capture();
    alert(`✨Pago realizado con éxito por ${details?.payer?.name?.given_name ?? 'cliente'}✨`);

    this.carritoService.exportarXML();

    const items = this.cartItems.map((ci) => ({
      producto_id: ci.product.id,
      cantidad: ci.quantity,
    }));
    const body = { items, total: this.totalPrecio };

    await firstValueFrom(this.http.post(`${this.apiBase}/api/checkout`, body));

    alert('Pedido confirmado. Stock actualizado.');
    this.vaciar();
  } catch (err) {
    console.error('Error en checkout:', err);
    alert('Ocurrió un error procesando la compra.');
  } finally {
    this.isSubmitting = false;
  }
},

      onError: (err: unknown) => {
        console.error('Error en PayPal:', err);
        alert('Ocurrió un error con el pago. Intenta nuevamente.');
      },
    }).render('#paypal-button-container');
  }
}

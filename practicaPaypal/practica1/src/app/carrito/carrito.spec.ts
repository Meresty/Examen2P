import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService, CartItem } from '../services/carrito.service';
import { HttpClient } from '@angular/common/http';

declare var paypal: any;

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.css']
})
export class CarritoComponent implements OnInit, AfterViewInit {
  cartItems: CartItem[] = [];
  totalPrecio: number = 0;

  constructor(
    private carritoService: CarritoService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.carritoService.cart$.subscribe(items => {
      this.cartItems = items;
      this.totalPrecio = this.carritoService.obtenerTotalPrecio();
      if (typeof paypal !== 'undefined') {
        this.renderizarBotonPayPal();
      }
    });
  }

  ngAfterViewInit(): void {
    this.cargarPayPalSDK().then(() => {
      this.renderizarBotonPayPal();
    });
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
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  exportarXML(): void {
    if (this.cartItems.length === 0) {
      alert('El carrito está vacío. Añade productos antes de generar la factura.');
      return;
    }
    this.carritoService.exportarXML();
  }

  private cargarPayPalSDK(): Promise<void> {
    return new Promise(resolve => {
      if (document.getElementById('paypal-sdk')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      script.src = 'https://www.paypal.com/sdk/js?client-id=AVqcQM2wfBQ-nCGLGpH8NZXxRXTIy1TlKs5jBAzVz9Y6_rfbo0rpBez5hAQOpyf5j1eWYnKeH4j1V07g&currency=MXN';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  private renderizarBotonPayPal(): void {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    container.innerHTML = '';

    paypal.Buttons({
      style: {
        color: 'gold',
        shape: 'pill',
        label: 'pay',
        layout: 'vertical'
      },
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: { value: this.totalPrecio.toFixed(2) },
            description: 'Compra en Witchly - Videojuegos Educativos'
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          alert(`✨ Pago realizado con éxito por ${details.payer.name.given_name}`);

          this.http.get('http://localhost:4000/api/catalogo/test')
            .subscribe({
              next: (res) => {
                alert('✅ Conexión con la base de datos exitosa: ' + JSON.stringify(res));
                this.vaciar();
              },
              error: (err) => {
                console.error('❌ Error conectando con la BD', err);
                alert('Error al conectar con la base de datos. Revisa la consola.');
              }
            });
        });
      },
      onError: (err: any) => {
        console.error('Error con PayPal:', err);
        alert('❌ Ocurrió un error con el pago. Intenta nuevamente.');
      }
    }).render('#paypal-button-container');
  }
}

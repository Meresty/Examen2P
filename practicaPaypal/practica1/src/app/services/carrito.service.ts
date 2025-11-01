import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
   cartItems: CartItem[] = [];
   cartSubject = new BehaviorSubject<CartItem[]>(this.cartItems);
  public cart$: Observable<CartItem[]> = this.cartSubject.asObservable();

  constructor() {
    const savedCart = localStorage.getItem('carrito');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next(this.cartItems);
    }
  }

  agregarAlCarrito(producto: Product, cantidad: number = 1): void {
    const existingItemIndex = this.cartItems.findIndex(item => item.product.id === producto.id);
    
    if (existingItemIndex > -1) {

      this.cartItems[existingItemIndex].quantity += cantidad;

    } else {

      this.cartItems.push({ product: producto, quantity: cantidad });

    }
    
    this.guardarCarrito();
    this.cartSubject.next([...this.cartItems]);
  }


  removerDelCarrito(productId: number): void {
    this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
    this.guardarCarrito();
    this.cartSubject.next(this.cartItems);
  }


  actualizarCantidad(productId: number, nuevaCantidad: number): void {
    const itemIndex = this.cartItems.findIndex(item => item.product.id === productId);
    if (itemIndex > -1 && nuevaCantidad > 0) {
      this.cartItems[itemIndex].quantity = nuevaCantidad;
      this.guardarCarrito();
      this.cartSubject.next([...this.cartItems]);
    } else if (nuevaCantidad <= 0) {
      this.removerDelCarrito(productId);
    }
  }

  


  obtenerTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }


  obtenerTotalPrecio(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.precio * item.quantity), 0);
  }


  limpiarCarrito(): void {
    this.cartItems = [];
    this.guardarCarrito();
    this.cartSubject.next(this.cartItems);
  }

  private guardarCarrito(): void {
    localStorage.setItem('carrito', JSON.stringify(this.cartItems));
  }


  exportarXML(): void {

  const escapeXML = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<recibo id="${Date.now()}">\n`;
  xml += `  <fecha>${new Date().toISOString()}</fecha>\n`;

  for (const item of this.cartItems) {
    xml += `  <producto>\n`;
    xml += `    <id>${item.product.id}</id>\n`;
    xml += `    <nombre>${escapeXML(item.product.nombre)}</nombre>\n`;
    xml += `    <precio>${item.product.precio}</precio>\n`;
    xml += `    <cantidad>${item.quantity}</cantidad>\n`;
    if (item.product.descripcion) {
      xml += `    <descripcion>${escapeXML(item.product.descripcion)}</descripcion>\n`;
    }
    xml += `  </producto>\n`;
  }

  xml += `  <total>${this.obtenerTotalPrecio()}</total>\n`;
  xml += `</recibo>`;

  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recibo_${new Date().toISOString().split('T')[0]}.xml`;
  a.click();
  URL.revokeObjectURL(url);
}
  
}
import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly API = 'http://localhost:4000';

  async getProductos(): Promise<Product[]> {
    const r = await fetch(`${this.API}/api/catalogo`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();

    return (data as any[]).map(p => {
      const raw = String(p.imagen ?? '').trim();


      const isAbsolute = /^https?:\/\//i.test(raw) || raw.startsWith('data:image/');

      
      const imagen = isAbsolute
        ? raw
        : raw.startsWith('images/')
          ? `${this.API}/${raw}`
          : `${this.API}/images/${raw.replace(/^\/+/, '')}`; // fallback

      return {
        id: Number(p.id),
        nombre: p.nombre,
        precio: Number(p.precio),
        descripcion: p.descripcion ?? '',
        stock: Number(p.stock ?? 0),
        imagen,
      } as Product;
    });
  }
}

import { Component, OnInit } from "@angular/core";
import { Product } from "../models/product";
import { ProductoService } from "../services/producto.service";
import { CarritoService } from "../services/carrito.service";
import { NgForOf, NgIf } from "@angular/common";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-catalogo',
    standalone: true,
    imports: [NgForOf, NgIf, CommonModule],
    templateUrl: './catalogo.html',
    styleUrls: ['./catalogo.css']
})
export class CatalogoComponent implements OnInit {
    productos: Product[] = [];
    
    constructor(
        private productoService: ProductoService,
        public carritoService: CarritoService 
    ) {}

    async ngOnInit() {
        this.productos = await this.productoService.getProductos();
        console.log('Productos obtenidos del XML:', this.productos);
    }

    agregarAlCarrito(producto: Product): void {
        this.carritoService.agregarAlCarrito(producto);
        console.log(`Producto ${producto.nombre} agregado al carrito`);
    }

    getCantidadEnCarrito(productId: number): number {
        const item = this.carritoService.cartItems.find(item => item.product.id === productId);
        return item ? item.quantity : 0;
    }
}
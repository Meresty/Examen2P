import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CatalogoComponent } from './catalogo';
import { ProductoService } from '../services/producto.service';
import { CarritoService } from '../services/carrito.service';

describe('CatalogoComponent', () => {
  let component: CatalogoComponent;
  let fixture: ComponentFixture<CatalogoComponent>;

  const productoServiceMock = {
    getProductos: () => Promise.resolve([]),
  };

  const carritoServiceMock = {
    cartItems: [],
    agregarAlCarrito: jasmine.createSpy('agregarAlCarrito'),
    actualizarCantidad: jasmine.createSpy('actualizarCantidad'),
    obtenerTotalItems: () => 0,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoComponent],   // 👈 standalone: va en imports, no en declarations
      providers: [
        { provide: ProductoService, useValue: productoServiceMock },
        { provide: CarritoService, useValue: carritoServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

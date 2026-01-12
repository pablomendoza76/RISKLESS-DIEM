import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosAseguradoComponent } from './pedidos-asegurado.component';

describe('PedidosAseguradoComponent', () => {
  let component: PedidosAseguradoComponent;
  let fixture: ComponentFixture<PedidosAseguradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosAseguradoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidosAseguradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

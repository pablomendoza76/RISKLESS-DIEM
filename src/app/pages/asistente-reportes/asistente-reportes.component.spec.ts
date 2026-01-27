import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenteReportesComponent } from './asistente-reportes.component';

describe('AsistenteReportesComponent', () => {
  let component: AsistenteReportesComponent;
  let fixture: ComponentFixture<AsistenteReportesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenteReportesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsistenteReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

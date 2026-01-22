import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAsesorComponent } from './dashboard-asesor.component';

describe('DashboardAsesorComponent', () => {
  let component: DashboardAsesorComponent;
  let fixture: ComponentFixture<DashboardAsesorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAsesorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardAsesorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

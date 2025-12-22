import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeAsesorComponent } from './home-asesor.component';

describe('HomeAsesorComponent', () => {
  let component: HomeAsesorComponent;
  let fixture: ComponentFixture<HomeAsesorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeAsesorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeAsesorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolizaFormComponent } from './poliza-form.component';

describe('PolizaFormComponent', () => {
  let component: PolizaFormComponent;
  let fixture: ComponentFixture<PolizaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolizaFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolizaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

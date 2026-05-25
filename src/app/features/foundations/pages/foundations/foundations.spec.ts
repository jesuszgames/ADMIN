import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Foundations } from './foundations';

describe('Foundations', () => {
  let component: Foundations;
  let fixture: ComponentFixture<Foundations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Foundations],
    }).compileComponents();

    fixture = TestBed.createComponent(Foundations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

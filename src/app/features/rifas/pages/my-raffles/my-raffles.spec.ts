import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Raffles } from './my-raffles';

describe('Raffles', () => {
  let component: Raffles;
  let fixture: ComponentFixture<Raffles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Raffles],
    }).compileComponents();

    fixture = TestBed.createComponent(Raffles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

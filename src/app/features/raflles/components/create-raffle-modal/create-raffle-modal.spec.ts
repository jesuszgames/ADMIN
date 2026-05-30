import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRaffleModal } from './create-raffle-modal';

describe('CreateRaffleModal', () => {
  let component: CreateRaffleModal;
  let fixture: ComponentFixture<CreateRaffleModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRaffleModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRaffleModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

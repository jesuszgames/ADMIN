import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryRafflesModal } from './history-raffles-modal';

describe('HistoryRafflesModal', () => {
  let component: HistoryRafflesModal;
  let fixture: ComponentFixture<HistoryRafflesModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryRafflesModal],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryRafflesModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

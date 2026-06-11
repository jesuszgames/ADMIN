import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryTicketModel } from './history-ticket-model';

describe('HistoryTicketModel', () => {
  let component: HistoryTicketModel;
  let fixture: ComponentFixture<HistoryTicketModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryTicketModel],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryTicketModel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

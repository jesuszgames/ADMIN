import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorTicketModel } from './history-ticket-model';

describe('HistorTicketModel', () => {
  let component: HistorTicketModel;
  let fixture: ComponentFixture<HistorTicketModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorTicketModel],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorTicketModel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

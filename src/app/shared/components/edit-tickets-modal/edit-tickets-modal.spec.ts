import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTicketsModal } from './edit-tickets-modal';

describe('EditTicketsModal', () => {
  let component: EditTicketsModal;
  let fixture: ComponentFixture<EditTicketsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTicketsModal],
    }).compileComponents();

    fixture = TestBed.createComponent(EditTicketsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

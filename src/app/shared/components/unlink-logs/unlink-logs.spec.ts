import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlinkLogs } from './unlink-logs';

describe('UnlinkLogs', () => {
  let component: UnlinkLogs;
  let fixture: ComponentFixture<UnlinkLogs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnlinkLogs],
    }).compileComponents();

    fixture = TestBed.createComponent(UnlinkLogs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsingAnnotoriousComponent } from './using-annotorious.component';

describe('UsingAnnotoriousComponent', () => {
  let component: UsingAnnotoriousComponent;
  let fixture: ComponentFixture<UsingAnnotoriousComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsingAnnotoriousComponent]
    });
    fixture = TestBed.createComponent(UsingAnnotoriousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

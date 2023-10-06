import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageProofingComponent } from './image-proofing.component';

describe('ImageProofingComponent', () => {
  let component: ImageProofingComponent;
  let fixture: ComponentFixture<ImageProofingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImageProofingComponent]
    });
    fixture = TestBed.createComponent(ImageProofingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

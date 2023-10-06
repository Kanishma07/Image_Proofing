import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCommentComponent } from './image-comment.component';

describe('ImageCommentComponent', () => {
  let component: ImageCommentComponent;
  let fixture: ComponentFixture<ImageCommentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImageCommentComponent]
    });
    fixture = TestBed.createComponent(ImageCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

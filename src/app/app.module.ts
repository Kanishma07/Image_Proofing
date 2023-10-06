import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from './loading/loading.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import  {MatProgressBarModule } from '@angular/material/progress-bar';
import { ImageProofingComponent } from './image-proofing/image-proofing.component';
import { NgxAnnotateTextModule } from "ngx-annotate-text";
import { ImageCommentComponent } from './image-comment/image-comment.component';
import { CustomDialogComponent } from './image-comment/custom-dialog/custom-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
// import { UsingAnnotoriousComponent } from './using-annotorious/using-annotorious.component';

@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent,
    ImageProofingComponent,
    ImageCommentComponent,
    CustomDialogComponent,
    // UsingAnnotoriousComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatProgressBarModule,
    NgxAnnotateTextModule,
    MatDialogModule,
    MatFormFieldModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-custom-dialog',
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['./custom-dialog.component.css']
})
export class CustomDialogComponent {
  commentText: string = '';
  @Output() commentAdded = new EventEmitter<string>();

  addComment() {
    if (this.commentText) {
      this.commentAdded.emit(this.commentText);
      this.commentText = '';
    }
  }

  constructor(private dialog: MatDialog) { }

openDialog() {
  const dialogRef = this.dialog.open(CustomDialogComponent, {
    width: '400px',
    data: {}, // You can pass data to the dialog if needed
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      console.log('Dialog closed with result:', result);
    }
  });
}
  
  // onCancelClick(): void {
  //   this.dialogRef.close();
  // }

  // onSaveClick(): void {
  //   this.dialogRef.close(this.commentText);
  // }
}

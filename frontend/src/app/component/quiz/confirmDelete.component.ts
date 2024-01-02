import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-exit-dialog',
  template: `
    <h2 mat-dialog-title>Confirmation</h2>
    <div mat-dialog-content>
      {{ data.message }}
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">No</button>
      <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Yes</button>
    </div>
  `,
})
export class ConfirmDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}

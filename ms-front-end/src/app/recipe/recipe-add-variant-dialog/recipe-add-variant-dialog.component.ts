import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-recipe-add-variant-dialog',
  templateUrl: './recipe-add-variant-dialog.component.html',
  styleUrls: ['./recipe-add-variant-dialog.component.scss']
})
export class RecipeAddVariantDialogComponent implements OnInit {

  recipeForm = this.fb.group({
    title: ['', Validators.required],
  });
  isCreating = false;


  constructor(
    public dialogRef: MatDialogRef<RecipeAddVariantDialogComponent>,
    private fb: FormBuilder) {}

  ngOnInit(): void {
  }

  createVariant(): void {
    if (this.recipeForm.get('title').valid && !this.isCreating) {
      this.isCreating = true;
      this.dialogRef.close(this.recipeForm.get('title').value);
    }
  }
}

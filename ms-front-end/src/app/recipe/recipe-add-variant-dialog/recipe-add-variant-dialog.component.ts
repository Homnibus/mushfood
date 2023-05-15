import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";

@Component({
  selector: "app-recipe-add-variant-dialog",
  templateUrl: "./recipe-add-variant-dialog.component.html",
  styleUrls: ["./recipe-add-variant-dialog.component.scss"],
})
export class RecipeAddVariantDialogComponent {
  recipeForm = this.fb.group({
    title: ["", Validators.required],
  });
  isCreating = false;

  constructor(
    public dialogRef: MatDialogRef<RecipeAddVariantDialogComponent>,
    private fb: UntypedFormBuilder
  ) {}

  createVariant(): void {
    if (this.recipeForm.get("title").valid && !this.isCreating) {
      this.isCreating = true;
      this.dialogRef.close(this.recipeForm.get("title").value);
    }
  }
}

import { Component } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";

@Component({
  selector: "app-recipe-add-group-dialog",
  templateUrl: "./recipe-add-group-dialog.component.html",
  styleUrls: ["./recipe-add-group-dialog.component.scss"],
})
export class RecipeAddGroupDialogComponent {
  addIngredientGroupForm = this.fb.group({
    title: ["", Validators.required],
  });
  isCreating = false;

  constructor(
    public dialogRef: MatDialogRef<RecipeAddGroupDialogComponent>,
    private fb: UntypedFormBuilder
  ) {}

  createIngredientGroup() {
    if (this.addIngredientGroupForm.get("title").valid && !this.isCreating) {
      this.isCreating = true;
      this.dialogRef.close(this.addIngredientGroupForm.get("title").value);
    }
  }
}

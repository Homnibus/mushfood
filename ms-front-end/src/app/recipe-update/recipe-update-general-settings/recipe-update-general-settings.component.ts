import { Component, OnInit } from "@angular/core";
import { FormGroup, UntypedFormBuilder, Validators } from "@angular/forms";
import { debounceTime, distinctUntilChanged, first } from "rxjs/operators";
import { Router } from "@angular/router";
import { MatLegacySnackBar as MatSnackBar } from "@angular/material/legacy-snack-bar";
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";
import { RecipeService } from "../../recipe/services/recipe.service";

@Component({
  selector: "app-recipe-update-general-settings",
  templateUrl: "./recipe-update-general-settings.component.html",
  styleUrls: ["./recipe-update-general-settings.component.scss"],
})
export class RecipeUpdateGeneralSettingsComponent implements OnInit {
  recipeForm: FormGroup;

  constructor(
    private recipeService: RecipeService,
    private fb: UntypedFormBuilder,
    private router: Router,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // TODO : set portions to be positives
    // The active recipe is already initialized in the parent tab component
    this.recipeService.activeRecipe$.pipe(first()).subscribe((activeRecipe) => {
      this.recipeForm = this.fb.group({
        title: [activeRecipe.title, Validators.required],
        inspiration: [activeRecipe.inspiration],
        portions: [activeRecipe.portions],
      });
    });

    this.recipeForm.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((data) => {
        if (!this.recipeForm.valid) {
          return;
        }
        this.recipeService.addRecipeGeneralSettingsToUpdate(
          data.title,
          data.inspiration,
          data.portions
        );
      });
  }

  deleteRecipe(): void {
    const dialogRef = this.dialog.open(RecipeUpdateDeleteDialogComponent, {
      width: "250px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === "delete") {
        this.recipeService.deleteRecipe().subscribe(() => {
          this.snackBar.open("Recipe Deleted !", "Close", { duration: 2000 });
          this.router.navigateByUrl("/recipe");
        });
      }
    });
  }
}

@Component({
  selector: "app-recipe-update-delete-dialog",
  templateUrl: "recipe-update-delete-dialog.component.html",
  styleUrls: ["./recipe-update-delete-dialog.component.scss"],
})
export class RecipeUpdateDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RecipeUpdateDeleteDialogComponent>
  ) {}
}

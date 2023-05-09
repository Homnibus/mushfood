import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { RecipeImage } from "../../app.models";
import { Subscription } from "rxjs";
import { RecipeImageService } from "../services/recipe-image.service";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { filter, first, tap } from "rxjs/operators";
import { RecipeService } from "src/app/recipe/services/recipe.service";

@Component({
  selector: "app-recipe-image-update",
  templateUrl: "./recipe-image-update.component.html",
  styleUrls: ["./recipe-image-update.component.scss"],
})
export class RecipeImageUpdateComponent implements OnInit, OnDestroy {
  @Output() recipeImageFileChanged = new EventEmitter<File>();
  @Output() recipeImageCreated = new EventEmitter<File>();
  recipeImage: RecipeImage;
  recipeImageOnFileChangeSubscription: Subscription;
  imgURL: string | ArrayBuffer;
  recipeImageFormGroup: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private recipeImageService: RecipeImageService,
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    this.recipeService.activeRecipe$.pipe(first()).subscribe((activeRecipe) => {
      this.recipeImageService
        .initActiveRecipeImage(activeRecipe, true)
        .subscribe((activeRecipeImage) => {
          this.recipeImage = activeRecipeImage;
          if (activeRecipeImage?.imageFile) {
            this.preview(activeRecipeImage?.imageFile);
          } else {
            this.imgURL = activeRecipeImage?.imageUrl;
          }
        });
    });

    this.recipeImageFormGroup = this.fb.group({
      recipeImageFile: [undefined, this.recipeImageService.imageTypeValidator],
    });

    this.recipeImageOnFileChangeSubscription = this.recipeImageFormGroup
      .get("recipeImageFile")
      .valueChanges.pipe(
        filter((file) => !!file),
        filter(() => this.recipeImageFormGroup.get("recipeImageFile").valid),
        tap((file) => this.preview(file))
      )
      .subscribe((file) => this.createOrUpdateRecipeImage(file));
  }

  ngOnDestroy(): void {
    this.recipeImageOnFileChangeSubscription.unsubscribe();
  }

  updateFormValue(files: FileList) {
    this.recipeImageFormGroup
      .get("recipeImageFile")
      .patchValue(files.length === 0 ? undefined : files[0]);
  }

  preview(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    };
  }

  createOrUpdateRecipeImage(imageFile: File): void {
    if (!this.recipeImage) {
      // Create
      this.recipeImageService.addRecipeImageToCreate(imageFile);
    } else {
      // Update
      this.recipeImageService.addRecipeImageToUpdate(imageFile);
    }
  }
}

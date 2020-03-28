import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {RecipeImage} from '../../app.models';
import {Subscription} from 'rxjs';
import {RecipeImageService} from '../services/recipe-image.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {filter, tap} from 'rxjs/operators';

@Component({
  selector: 'app-recipe-image-update',
  templateUrl: './recipe-image-update.component.html',
  styleUrls: ['./recipe-image-update.component.scss']
})
export class RecipeImageUpdateComponent implements OnInit, OnDestroy {

  @Input() recipeImage: RecipeImage;
  @Output() recipeImageFileChanged = new EventEmitter<File>();
  @Output() recipeImageCreated = new EventEmitter<File>();
  recipeImageOnFileChangeSubscription: Subscription;
  imgURL: string | ArrayBuffer;
  recipeImageFormGroup: FormGroup;

  constructor(private fb: FormBuilder,
              public recipeImageService: RecipeImageService) {
  }

  ngOnInit(): void {
    this.recipeImageFormGroup = this.fb.group({
      recipeImageFile: [undefined, this.recipeImageService.emailDomainValidator],
    });

    if (this.recipeImage?.imageFile) {
      this.preview(this.recipeImage?.imageFile);
    } else {
      this.imgURL = this.recipeImage?.imageUrl;
    }

    this.recipeImageOnFileChangeSubscription = this.recipeImageFormGroup.get('recipeImageFile').valueChanges.pipe(
      filter(file => !!file),
      filter(() => this.recipeImageFormGroup.get('recipeImageFile').valid),
      tap(file => this.preview(file)),
    ).subscribe(file => this.createOrUpdateRecipeImage(file));
  }

  ngOnDestroy(): void {
    this.recipeImageOnFileChangeSubscription.unsubscribe();
  }

  updateFormValue(files: FileList) {
    this.recipeImageFormGroup.get('recipeImageFile').patchValue(files.length === 0 ? undefined : files[0]);
  }

  preview(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    };
  }

  createOrUpdateRecipeImage(imageFile: File): void {
    if (!this.recipeImage) { // Create
      this.recipeImageCreated.emit(imageFile);
    } else { // Update
      this.recipeImageFileChanged.emit(imageFile);
    }
  }

}

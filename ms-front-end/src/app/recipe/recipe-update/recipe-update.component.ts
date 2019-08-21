import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {Recipe, RecipeImage} from '../../app.models';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {RecipeService} from '../services/recipes.service';
import {map, switchMap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {RecipeImageService} from '../services/recipeImage.service';

@Component({
  selector: 'app-recipe-update',
  templateUrl: './recipe-update.component.html',
  styleUrls: ['./recipe-update.component.css']
})
export class RecipeUpdateComponent implements OnInit {

  recipeForm = this.fb.group({
    title: ['', Validators.required],
    instructions: ['']
  });

  recipe$: Observable<Recipe>;
  recipe: Recipe;
  recipeImage: RecipeImage;

  constructor(private fb: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private recipeService: RecipeService,
              private recipeImageService: RecipeImageService) {
  }

  ngOnInit() {
    this.recipe$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this.recipeService.get(params.get('slug'))),
      map(recipeList => recipeList.length ? recipeList[0] : undefined)
    );
    this.recipe$.subscribe(recipe => {
      this.recipe = recipe;
      this.initForm(recipe);
      this.recipeImageService.filteredList(`recipe__id=${recipe.id}`).pipe(
        map(recipeImageList => recipeImageList.length ? recipeImageList[0] : undefined)
      ).subscribe(recipeImage => this.recipeImage = recipeImage);
    });

  }

  initForm(recipe: Recipe): void {
    this.recipeForm.reset({title: recipe.title, instructions: recipe.instructions});
  }

  submit(): void {
    if (this.recipeForm.valid && this.recipeForm.dirty) {

      const updatedRecipe = Object.assign({}, this.recipe);
      updatedRecipe.title = this.recipeForm.get('title').value;
      updatedRecipe.instructions = this.recipeForm.get('instructions').value;
      this.recipeService.update(updatedRecipe).subscribe(
        recipe => {
          const recipeDetailsUrl = this.router.createUrlTree(['/recipe/details', recipe.slug]);
          this.router.navigateByUrl(recipeDetailsUrl);
        }
      );
    }
  }

  /*
    onFileSelected() {
      const inputNode: any = document.querySelector('#file');

      if (typeof (FileReader) !== 'undefined') {
        const reader = new FileReader();

        reader.onload = (e: any) => {
          // this.srcResult = e.target.result;
          console.log('file loaded :');
          console.log(e.target.result);
          console.log(inputNode.files[0]);
          this.srcResult = inputNode.files[0];
        };

        reader.readAsArrayBuffer(inputNode.files[0]);
      }
    }*/

  sendFile() {
    const inputNode: any = document.querySelector('#file');
    if (inputNode.files.length > 0) {
      this.createOrUpdate(inputNode.files[0]).subscribe(value => this.recipeImage = value);
    } else {
      console.log('no file');
    }
  }

  deleteRecipeImage(): void {
    this.recipeImageService.delete(this.recipeImage).subscribe(data => this.recipeImage = undefined);
  }

  createOrUpdate(file: any): Observable<RecipeImage> {
    let httpObservable: Observable<RecipeImage>;
    if (!this.recipeImage) { // Create
      const newRecipeImage = new RecipeImage();
      newRecipeImage.recipe = this.recipe.id;
      newRecipeImage.image = file;
      httpObservable = this.recipeImageService.create(newRecipeImage);
    } else { // Update
      const recipeImageCopy = Object.assign({}, this.recipeImage);
      recipeImageCopy.image = file;
      httpObservable = this.recipeImageService.update(recipeImageCopy);
    }
    return httpObservable;
  }

}

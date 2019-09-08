import {Component, Input, OnInit} from '@angular/core';
import {Ingredient, IngredientQuantity, MeasurementUnit, Recipe} from '../../app.models';
import {FormBuilder, Validators} from '@angular/forms';
import {IngredientService} from '../services/ingredient.service';
import {IngredientQuantityService} from '../services/ingredientQuantity.service';
import {MeasurementUnitService} from '../services/MeasurementUnit.service';
import {Observable, of} from 'rxjs';
import {map, startWith, switchMap, tap} from 'rxjs/operators';

@Component({
  selector: 'app-ingredient-quantity-update',
  templateUrl: './ingredient-quantity-update.component.html',
  styleUrls: ['./ingredient-quantity-update.component.css']
})
export class IngredientQuantityUpdateComponent implements OnInit {

  @Input() recipe: Recipe;
  ingredientQuantityList: IngredientQuantity[];
  measurementUnitList$: Observable<MeasurementUnit[]>;
  ingredientList: Ingredient[];
  filteredIngredientList$: Observable<Ingredient[]>;

  ingredientForm = this.fb.group({
    quantity: ['', Validators.required],
    measurementUnit: ['', Validators.required],
    ingredient: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private ingredientService: IngredientService,
    private ingredientQuantityService: IngredientQuantityService,
    private measurementUnitService: MeasurementUnitService,
  ) {
  }

  ngOnInit() {
    // Retrieve the list of the currents recipe ingredient.
    this.ingredientQuantityService.filteredList(`recipe__id=${this.recipe.id}`).subscribe(
      ingredientQuantityList => this.ingredientQuantityList = ingredientQuantityList
    );

    // Retrieve the list of the already existing ingredients.
    // Create an Observable that emit a filtered ingredient list according to the ingredient field value.
    this.ingredientService.list().subscribe(ingredientList => {
      this.ingredientList = ingredientList;
      this.filteredIngredientList$ = this.ingredientForm.get('ingredient').valueChanges.pipe(
        startWith(''), // Needed to create the ingredient filtered list before the user start using the input.
        map(ingredient => this.filterIngredientList(ingredient))
      );
    });

    // Retrieve the list of the allowed measurement unit.
    this.measurementUnitList$ = this.measurementUnitService.list();
  }

  addIngredientQuantity(): void {
    // Only send a creation request if the form is valid.
    if (this.ingredientForm.valid && this.ingredientForm.dirty) {
      // Initialise a new ingredientQuantity and the set the form values
      const ingredientQuantity = new IngredientQuantity();
      ingredientQuantity.recipe = this.recipe.id;
      ingredientQuantity.quantity = this.ingredientForm.get('quantity').value;
      ingredientQuantity.measurementUnit = this.ingredientForm.get('measurementUnit').value;
      // The ingredient of the new ingredientQuantity might need to be created before.
      // Create an ingredientObservable in order to do so.
      const createOrGetIngredientObservable = this.createOrGetIngredient(this.ingredientForm.get('ingredient').value).pipe(
        tap(ingredient => ingredientQuantity.ingredient = ingredient)
      );

      // Create the ingredientQuantity by calling the API.
      // Reset the form and add the created ingredientQuantity to the list of the currents recipe ingredient.
      createOrGetIngredientObservable.pipe(
        switchMap(ingredient => this.ingredientQuantityService.create(ingredientQuantity))
      ).subscribe(newIngredientQuantity => {
        this.ingredientForm.reset();
        newIngredientQuantity.ingredient = ingredientQuantity.ingredient;
        newIngredientQuantity.measurementUnit = ingredientQuantity.measurementUnit;
        this.ingredientQuantityList.push(newIngredientQuantity);
      });
    }
  }

  updateIngredientQuantity(toUpdateIngredientQuantity: IngredientQuantity): void {
    // The ingredient of the updated ingredientQuantity might need to be created before calling the API.
    // Create an ingredientObservable in order to do so.
    const createOrGetIngredientObservable = this.createOrGetIngredient(toUpdateIngredientQuantity.ingredient).pipe(
      tap(ingredient => toUpdateIngredientQuantity.ingredient = ingredient)
    );

    // Update the ingredientQuantity by calling the API.
    // Add the created ingredientQuantity to the list of the currents recipe ingredient.
    createOrGetIngredientObservable.pipe(
      switchMap(ingredient => this.ingredientQuantityService.update(toUpdateIngredientQuantity))
    ).subscribe(
      ingredientQuantity => {
        const elementPos = this.ingredientQuantityList.map(x => x.id).indexOf(ingredientQuantity.id);
        const updatedQuantityList =  this.ingredientQuantityList.slice();
        updatedQuantityList[elementPos] = toUpdateIngredientQuantity;
        this.ingredientQuantityList = updatedQuantityList;
      }
    );
  }

  deleteIngredientQuantity(ingredientQuantity: IngredientQuantity): void {
    // Delete the ingredient from the recipe by calling the API.
    this.ingredientQuantityService.delete(ingredientQuantity).subscribe();
    this.ingredientQuantityList = this.ingredientQuantityList.filter(
      toFilterIngredientQuantity => toFilterIngredientQuantity.id !== ingredientQuantity.id
    );
  }

  createOrGetIngredient(inputIngredient: Ingredient | string): Observable<Ingredient> {
    let ingredientObservable: Observable<Ingredient>;
    if (inputIngredient instanceof Ingredient) {
      ingredientObservable = of(inputIngredient);
    } else {
      const ingredient = new Ingredient();
      ingredient.name = inputIngredient;
      ingredientObservable = this.ingredientService.create(ingredient).pipe(
        // Add the new ingredient to the current ingredient list.
        tap(newIngredient => this.ingredientList.push(newIngredient)),
      );
    }
    return ingredientObservable;
  }

  displayIngredient(ingredient?: Ingredient): string | undefined {
    return ingredient ? ingredient.name : undefined;
  }

  private filterIngredientList(ingredient: Ingredient | string): Ingredient[] {
    let filterValue = '';
    if (ingredient) {
      if (ingredient instanceof Ingredient) {
        filterValue = ingredient.name.toLowerCase();
      } else {
        filterValue = ingredient.toLowerCase();
      }
    }
    return this.ingredientList.filter(toFilterIngredient => toFilterIngredient.name.toLowerCase().includes(filterValue));
  }
}

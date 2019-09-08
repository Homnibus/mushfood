import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Ingredient, IngredientQuantity, MeasurementUnit} from '../../app.models';
import {FormBuilder, Validators} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-ingredient-quantity-details',
  templateUrl: './ingredient-quantity-details.component.html',
  styleUrls: ['./ingredient-quantity-details.component.css']
})
export class IngredientQuantityDetailsComponent implements OnInit {
  @Input() ingredientQuantity: IngredientQuantity;
  @Input() measurementUnitList: MeasurementUnit[];
  @Input() ingredientList: Ingredient[];
  @Output() deleted = new EventEmitter();
  @Output() updated = new EventEmitter<IngredientQuantity>();
  modificationIsActive = false;
  filteredIngredientList$: Observable<Ingredient[]>;
  ingredientForm = this.fb.group({
    quantity: ['', Validators.required],
    measurementUnit: ['', Validators.required],
    ingredient: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    this.filteredIngredientList$ = this.ingredientForm.get('ingredient').valueChanges.pipe(
      startWith(''), // Needed to create the ingredient filtered list before the user start using the input.
      map(ingredient => this.filterIngredientList(ingredient))
    );
  }

  delete() {
    this.deleted.emit();
  }

  update() {
    // Only send a creation request if the form is valid.
    if (this.ingredientForm.valid && this.ingredientForm.dirty) {
      this.modificationIsActive = !this.modificationIsActive;
      const updatedIngredientQuantity = Object.assign({}, this.ingredientQuantity);
      updatedIngredientQuantity.quantity = this.ingredientForm.get('quantity').value;
      updatedIngredientQuantity.measurementUnit = this.ingredientForm.get('measurementUnit').value;
      updatedIngredientQuantity.ingredient = this.ingredientForm.get('ingredient').value;
      this.updated.emit(updatedIngredientQuantity);
    }
  }

  activeModification() {
    this.ingredientForm.get('quantity').reset(this.ingredientQuantity.quantity);
    this.ingredientForm.get('measurementUnit').reset(this.ingredientQuantity.measurementUnit);
    this.ingredientForm.get('ingredient').reset(this.ingredientQuantity.ingredient);
    this.modificationIsActive = !this.modificationIsActive;
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

  compareFn(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
}

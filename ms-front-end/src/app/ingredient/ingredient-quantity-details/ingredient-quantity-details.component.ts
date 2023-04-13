import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  Ingredient,
  IngredientQuantity,
  MeasurementUnit,
} from "../../app.models";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { map, startWith } from "rxjs/operators";
import { Observable } from "rxjs";
import { IngredientQuantityService } from "../services/ingredient-quantity.service";

@Component({
  selector: "app-ingredient-quantity-details",
  templateUrl: "./ingredient-quantity-details.component.html",
  styleUrls: ["./ingredient-quantity-details.component.scss"],
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
    quantity: ["", Validators.required],
    measurementUnit: ["", Validators.required],
    ingredient: ["", Validators.required],
  });

  constructor(
    private fb: UntypedFormBuilder,
    public ingredientQuantityService: IngredientQuantityService
  ) {}

  ngOnInit(): void {
    this.filteredIngredientList$ = this.ingredientForm
      .get("ingredient")
      .valueChanges.pipe(
        startWith(""), // Needed to create the ingredient filtered list before the user start using the input.
        map((ingredient) =>
          this.ingredientQuantityService.filterIngredientList(
            ingredient,
            this.ingredientList
          )
        )
      );
  }

  delete() {
    this.deleted.emit();
  }

  update() {
    this.modificationIsActive = !this.modificationIsActive;
    // Only send a creation request if the form is valid.
    if (this.ingredientForm.valid && this.ingredientForm.dirty) {
      const updatedIngredientQuantity = Object.assign(
        {},
        this.ingredientQuantity
      );

      updatedIngredientQuantity.quantity =
        this.ingredientForm.get("quantity").value;
      updatedIngredientQuantity.measurementUnit =
        this.ingredientForm.get("measurementUnit").value;

      const formIngredient = this.ingredientForm.get("ingredient").value;
      if (formIngredient instanceof Ingredient) {
        updatedIngredientQuantity.ingredient = formIngredient;
      } else {
        // check if the ingredient already exist
        let ingredient = this.ingredientList.find(
          (listIngredient) =>
            listIngredient.name.trim().toLowerCase() ===
            formIngredient.trim().toLowerCase()
        );
        if (ingredient) {
          updatedIngredientQuantity.ingredient = ingredient;
        } else {
          ingredient = new Ingredient();
          ingredient.name = formIngredient;
          updatedIngredientQuantity.ingredient = ingredient;
        }
      }

      this.updated.emit(updatedIngredientQuantity);
    }
  }

  activeModification() {
    this.ingredientForm.get("quantity").reset(this.ingredientQuantity.quantity);
    this.ingredientForm
      .get("measurementUnit")
      .reset(this.ingredientQuantity.measurementUnit);
    this.ingredientForm
      .get("ingredient")
      .reset(this.ingredientQuantity.ingredient);
    this.modificationIsActive = !this.modificationIsActive;
  }

  compareFn(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
}

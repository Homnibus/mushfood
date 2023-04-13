import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  Ingredient,
  IngredientQuantity,
  MeasurementUnit,
  ModelState,
  Recipe,
} from "../../app.models";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { IngredientQuantityService } from "../services/ingredient-quantity.service";

@Component({
  selector: "app-ingredient-quantity-add",
  templateUrl: "./ingredient-quantity-add.component.html",
  styleUrls: ["./ingredient-quantity-add.component.scss"],
})
export class IngredientQuantityAddComponent implements OnInit {
  @Input() measurementUnitList: MeasurementUnit[];
  @Input() ingredientList: Ingredient[];
  @Input() recipe: Recipe;
  @Output() created = new EventEmitter<IngredientQuantity>();

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

  addIngredientQuantity(): void {
    // Only send a creation request if the form is valid.
    if (this.ingredientForm.valid && this.ingredientForm.dirty) {
      // Initialise a new ingredientQuantity and the set the form values
      const ingredientQuantity = new IngredientQuantity();
      ingredientQuantity.tempId = Date.now();
      ingredientQuantity.state = ModelState.NotSaved;
      //TODO : Change to account the new ingredient Group
      //ingredientQuantity.recipe = this.recipe.id;
      ingredientQuantity.quantity = this.ingredientForm.get("quantity").value;
      ingredientQuantity.measurementUnit =
        this.ingredientForm.get("measurementUnit").value;
      // Set the ingredient and add id to the list of ingredient to create if it does not exist.
      const formIngredient = this.ingredientForm.get("ingredient").value;
      // If the user select a existing ingredient
      if (formIngredient instanceof Ingredient) {
        ingredientQuantity.ingredient = formIngredient;
      } else {
        // check if the ingredient already exist
        let ingredient = this.ingredientList.find(
          (listIngredient) =>
            listIngredient.name.trim().toLowerCase() ===
            formIngredient.trim().toLowerCase()
        );
        if (ingredient) {
          ingredientQuantity.ingredient = ingredient;
        } else {
          ingredient = new Ingredient();
          ingredient.name = formIngredient;
          ingredientQuantity.ingredient = ingredient;
        }
      }

      // Add the ingredient Quantity to the list of ingredient to create when saving the recipe
      this.created.emit(ingredientQuantity);

      // Reset the form and add the created ingredientQuantity to the list of the currents recipe ingredient.
      this.ingredientForm.reset();
      // this.ingredientQuantityList.push(ingredientQuantity);
    }
  }
}

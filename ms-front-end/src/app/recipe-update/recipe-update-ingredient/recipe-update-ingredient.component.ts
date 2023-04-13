import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import {
  Ingredient,
  IngredientGroup,
  IngredientQuantity,
  ModelState,
  Recipe,
} from "../../app.models";
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  first,
  map,
  Observable,
  skip,
  startWith,
  Subscription,
} from "rxjs";
import { RecipeService } from "../../recipe/services/recipe.service";
import { IngredientQuantityService } from "../../ingredient/services/ingredient-quantity.service";
import { IngredientService } from "../../ingredient/services/ingredient.service";
import { MeasurementUnitService } from "../../ingredient/services/measurement-unit.service";
import { IngredientQuantityMentionService } from "../../ingredient/services/ingredient-quantity-mention.service";
import {
  FormArray,
  FormControl,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatTable } from "@angular/material/table";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { flyInOutTransition } from "src/app/shared/fly-in-out.animation";
import { IngredientGroupService } from "src/app/ingredient/services/ingredient-group.service";

export class GroupData {
  ingredientGroup: IngredientGroup;
  updateIngredientGroupNameForm: FormControl;
  ingredientQuantityList: IngredientQuantity[] = [];
  form: FormGroup;
  addIngredientForm: FormGroup;
  addIngredientFilteredIngredientList$: Observable<Ingredient[]>;
  filteredIngredientListObservableList: Observable<Ingredient[]>[] = [];
  ingredientQuantityValueChangesSubscriptionList: Subscription[] = [];
}

@Component({
  selector: "app-recipe-update-ingredient",
  templateUrl: "./recipe-update-ingredient.component.html",
  styleUrls: ["./recipe-update-ingredient.component.scss"],
  animations: [flyInOutTransition],
})
export class RecipeUpdateIngredientComponent implements OnInit, OnDestroy {
  recipe: Recipe;
  activeRecipeSubscription: Subscription;
  groupDataList: GroupData[] = [];
  ingredientGroupList: IngredientGroup[] = [];
  activeIngredientGroupSubscription: Subscription;
  activeIngredientQuantityListSubscription: Subscription;
  ingredientList: Ingredient[];
  activeIngredientListSubscription: Subscription;
  displayedColumns: string[] = [
    "draggable",
    "used",
    "quantity",
    "unit",
    "of",
    "ingredient",
    "deleteIngredient",
  ];
  @ViewChildren(MatTable) table: QueryList<MatTable<any>>;
  @ViewChild("addQuantityInputField") addQuantityInputField: ElementRef;
  addIngredientGroupForm = this.fb.group({
    title: ["", Validators.required],
  });
  isLoaded = false;
  //ingredientQuantityList: IngredientQuantity[] = [];
  // rows: FormArray = this.fb.array([]);
  // form: FormGroup = this.fb.group({ ingredientQuantity: this.rows });
  // tableFormList: FormGroup[] = [];
  // filteredIngredientListObservableList: Observable<Ingredient[]>[] = [];
  // ingredientQuantityValueChangesSubscriptionList: Subscription[] = [];
  // addIngredientFilteredIngredientList$: Observable<Ingredient[]>;
  // addIngredientForm = this.fb.group({
  //   quantity: [
  //     "",
  //     [
  //       Validators.required,
  //       Validators.pattern(
  //         "^(\\d{1,6}|\\d{1,5}[\\.,]\\d|\\d{1,4}[\\.,]\\d{2})$"
  //       ),
  //     ],
  //   ],
  //   measurementUnit: ["", Validators.required],
  //   ingredient: ["", Validators.required],
  // });

  constructor(
    private recipeService: RecipeService,
    private ingredientGroupService: IngredientGroupService,
    private ingredientService: IngredientService,
    public ingredientQuantityService: IngredientQuantityService,
    public measurementUnitService: MeasurementUnitService,
    public ingredientQuantityMentionService: IngredientQuantityMentionService,
    private fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    // Retrieve the active Recipe
    this.activeRecipeSubscription = this.recipeService.activeRecipe$.subscribe(
      (data) => {
        this.recipe = data;
      }
    );
    // Retrieve the ingredient list
    this.activeIngredientListSubscription =
      this.ingredientService.activeIngredientList$.subscribe((data) => {
        this.ingredientList = data;
      });
    // Retrieve the active Group
    // TODO : update information if needed ?
    this.activeIngredientGroupSubscription =
      this.ingredientGroupService.activeIngredientGroupList$.subscribe(
        (data) => {
          this.ingredientGroupList = data;
        }
      );
    // Retrieve the ingredient Quantity only if the first time and if some are created or deleted
    this.activeIngredientQuantityListSubscription =
      this.ingredientQuantityService.activeIngredientQuantityList$
        .pipe(
          skip(1)
          //   filter((data) => data.length != this.ingredientQuantityList.length)
        )
        .subscribe((data) => {
          //          this.ingredientQuantityList = data;
          this.updateGroupDataIngredient(data);
        });

    //    this.rows.push(this.addIngredientForm);

    // Initialize the GroupDataList
    // Update of the list will be handled manually
    combineLatest([
      this.ingredientQuantityService.activeIngredientQuantityList$,
      this.ingredientGroupService.activeIngredientGroupList$,
    ])
      .pipe(first())
      .subscribe(([ingredientQuantityList, ingredientGroupList]) => {
        // Create a GroupData for each ingredient group
        ingredientGroupList.forEach((ingredientGroup) => {
          // Filter the ingredient quantity corresponding to the ingredient group
          const filteredIngredientQuantityList = ingredientQuantityList.filter(
            (ingredientQuantity) =>
              ingredientQuantity.ingredientGroup == ingredientGroup.id
          );
          // Add the GroupData to the list
          const groupData = this.initGroupData(
            ingredientGroup,
            filteredIngredientQuantityList
          );
          this.groupDataList.push(groupData);
        });
        // State that the tables are initialized and can be show
        this.isLoaded = true;
      });

    // initialize the table formControl with data from activeIngredientQuantityList$
    // Update of the list will be handled manually
    // this.ingredientQuantityService.activeIngredientQuantityList$
    //   .pipe(first())
    //   .subscribe((ingredientQuantityList) => {
    //     //    this.ingredientQuantityList = ingredientQuantityList;
    //     this.addTable();
    //     (this.tableFormList[0].get("ingredientQuantity") as FormArray).push(
    //       this.addIngredientForm
    //     );
    //     ingredientQuantityList.forEach(
    //       (ingredientQuantity: IngredientQuantity) =>
    //         this.addRow(ingredientQuantity, this.tableFormList[0])
    //     );
    //     this.isLoaded = true;
    //   });

    // Initialize the autocomplete list for the add ingredient form
    // this.addIngredientFilteredIngredientList$ = this.addIngredientForm
    //   .get("ingredient")
    //   .valueChanges.pipe(
    //     startWith(""), // Needed to create the ingredient filtered list before the user start using the input.
    //     map((ingredient) =>
    //       this.ingredientQuantityService.filterIngredientList(
    //         ingredient,
    //         this.ingredientList
    //       )
    //     )
    //   );
  }

  ngOnDestroy(): void {
    this.activeRecipeSubscription.unsubscribe();
    this.activeIngredientQuantityListSubscription.unsubscribe();
    this.activeIngredientListSubscription.unsubscribe();
    this.activeIngredientGroupSubscription.unsubscribe();
  }

  initGroupData(
    ingredientGroup: IngredientGroup,
    ingredientQuantityList: IngredientQuantity[]
  ): GroupData {
    const groupData = new GroupData();
    groupData.ingredientGroup = ingredientGroup;
    groupData.ingredientQuantityList = ingredientQuantityList;

    // Create and add the update form control
    groupData.updateIngredientGroupNameForm = this.fb.control(
      ingredientGroup.title,
      [Validators.required]
    );
    // Add the subscription to the changes
    // TODO: gérer la subscription
    groupData.updateIngredientGroupNameForm.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => this.updateIngredientGroup(groupData));
    // Create and add the add ingredient form
    groupData.addIngredientForm = this.fb.group({
      quantity: [
        "",
        [
          Validators.required,
          Validators.pattern(
            "^(\\d{1,6}|\\d{1,5}[\\.,]\\d|\\d{1,4}[\\.,]\\d{2})$"
          ),
        ],
      ],
      measurementUnit: ["", Validators.required],
      ingredient: ["", Validators.required],
    });
    // Initialize the autocomplete list for the add ingredient form
    groupData.addIngredientFilteredIngredientList$ = groupData.addIngredientForm
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

    // Create and add the formArray
    const rows = this.fb.array([]);
    groupData.form = this.fb.group({ ingredientQuantity: rows });
    // Add the add ingredient form as the first form of the Array
    rows.push(groupData.addIngredientForm);
    // Populate the formArray
    ingredientQuantityList.forEach((ingredientQuantity: IngredientQuantity) =>
      this.addRow(ingredientQuantity, groupData)
    );

    return groupData;
  }

  // addTable(): void {
  //   // Create and add the formArray
  //   const rows = this.fb.array([]);
  //   const form = this.fb.group({ ingredientQuantity: rows });
  //   this.tableFormList.push(form);
  // }

  addRow(ingredientQuantity: IngredientQuantity, groupData: GroupData) {
    // Create and add the formGroup
    const row = this.fb.group({
      ingredient: [ingredientQuantity.ingredient, Validators.required],
      quantity: [
        ingredientQuantity.quantity,
        [
          Validators.required,
          Validators.pattern(
            "^(\\d{1,6}|\\d{1,5}[\\.,]\\d|\\d{1,4}[\\.,]\\d{2})$"
          ),
        ],
      ],
      measurementUnit: [
        ingredientQuantity.measurementUnit,
        Validators.required,
      ],
    });
    (groupData.form.get("ingredientQuantity") as FormArray).push(row);

    // Create the subscription to the ingredient change
    groupData.ingredientQuantityValueChangesSubscriptionList.push(
      row.valueChanges
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe(() => {
          this.changeComaToPoint(row);
          this.updateIngredientQuantity(ingredientQuantity, row);
        })
    );
    // Create the Observable for the ingredient name autocomplete
    groupData.filteredIngredientListObservableList.push(
      row.get("ingredient").valueChanges.pipe(
        // Needed to create the ingredient filtered list before the user start using the input.
        startWith(ingredientQuantity.ingredient.name),
        map((ingredient) =>
          this.ingredientQuantityService.filterIngredientList(
            ingredient,
            this.ingredientList
          )
        )
      )
    );
  }

  updateGroupDataIngredient(
    ingredientQuantityList: IngredientQuantity[]
  ): void {
    // Loop over the groupData and update the ingredient quantity list if needed
    this.groupDataList.forEach((groupData) => {
      // Filter the ingredient quantity corresponding to the ingredient group
      const filteredIngredientQuantityList = ingredientQuantityList.filter(
        (ingredientQuantity) =>
          ingredientQuantity.ingredientGroup === groupData.ingredientGroup.id ||
          ingredientQuantity.ingredientGroup ===
            groupData.ingredientGroup.tempId
      );
      if (
        filteredIngredientQuantityList.length !=
        groupData.ingredientQuantityList.length
      ) {
        groupData.ingredientQuantityList = filteredIngredientQuantityList.sort(
          (a: IngredientQuantity, b: IngredientQuantity) => a.rank - b.rank
        );
      }
    });
  }

  addIngredientQuantity(groupData: GroupData): void {
    // Only send a creation request if the form is valid.
    if (
      !groupData.addIngredientForm.valid ||
      !groupData.addIngredientForm.dirty
    ) {
      return;
    }
    // Change coma to point in the Quantity part of the form
    this.changeComaToPoint(groupData.addIngredientForm);

    // Initialize a new ingredientQuantity and the set the form values
    const ingredientQuantity = new IngredientQuantity();
    ingredientQuantity.tempId = Date.now();
    ingredientQuantity.state = ModelState.NotSaved;
    // Link the ingredient quantity to the ingredient group and use the temp ID if the ingredient group is not yet created
    ingredientQuantity.ingredientGroup = groupData.ingredientGroup.id
      ? groupData.ingredientGroup.id
      : groupData.ingredientGroup.tempId;
    ingredientQuantity.quantity =
      groupData.addIngredientForm.get("quantity").value;
    ingredientQuantity.measurementUnit =
      groupData.addIngredientForm.get("measurementUnit").value;
    // Set the ingredient and add id to the list of ingredient to create if it does not exist.
    const formIngredient = groupData.addIngredientForm.get("ingredient").value;
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
    // Reset the form and add the created ingredientQuantity to the list of the currents recipe ingredient.
    this.addQuantityInputField.nativeElement.focus();
    groupData.addIngredientForm.reset();

    // Add the ingredient Quantity to the list of ingredient to create when saving the recipe
    const newIngredientQuantity =
      this.ingredientQuantityService.addIngredientQuantityToCreate(
        ingredientQuantity
      );
    // Add the formControl for the new ingredientQuantity and the autocomplete observable
    this.addRow(newIngredientQuantity, groupData);
  }

  updateIngredientQuantity(
    toUpdateIngredientQuantity: IngredientQuantity,
    ingredientForm: FormGroup
  ): void {
    // Only send a creation request if the form is valid and modified
    if (!ingredientForm.valid || !ingredientForm.dirty) {
      return;
    }

    // Retrieve the form values to create the updated entity
    const updatedIngredientQuantity = Object.assign(
      {},
      toUpdateIngredientQuantity
    );

    updatedIngredientQuantity.quantity = ingredientForm.get("quantity").value;
    updatedIngredientQuantity.measurementUnit =
      ingredientForm.get("measurementUnit").value;

    const formIngredient = ingredientForm.get("ingredient").value;
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

    // Add the created ingredientQuantity to the list of the currents recipe ingredient.
    this.ingredientQuantityService.addIngredientQuantityToUpdate(
      updatedIngredientQuantity
    );
    const mentionUpdated = this.ingredientQuantityMentionService.updateMention(
      updatedIngredientQuantity,
      this.recipe
    );
    if (mentionUpdated) {
      this.recipe = this.recipeService.updateActiveRecipeInstruction(
        this.recipe.instructions
      );
    }
  }

  deleteIngredientQuantity(
    toDeleteIngredientQuantity: IngredientQuantity,
    rowIndex: number,
    groupData: GroupData
  ): void {
    // Delete the ingredient from the recipe by calling the API.
    this.ingredientQuantityService.addIngredientQuantityToDelete(
      toDeleteIngredientQuantity
    );
    // Remove the corresponding formControl
    (groupData.form.get("ingredientQuantity") as FormArray).removeAt(rowIndex);
    // Remove the observable for the ingredient autocomplete
    groupData.filteredIngredientListObservableList.splice(rowIndex - 1, 1);
  }

  addIngredientGroup(): void {
    // Only send a creation request if the form is valid.
    if (
      !this.addIngredientGroupForm.valid ||
      !this.addIngredientGroupForm.dirty
    ) {
      return;
    }

    // Initialize a new ingredientGroup and the set the form values
    const ingredientGroup = new IngredientGroup();
    ingredientGroup.tempId = Date.now();
    ingredientGroup.state = ModelState.NotSaved;
    ingredientGroup.title = this.addIngredientGroupForm.get("title").value;
    ingredientGroup.recipe = this.recipe.id;

    // Reset the form and add the created ingredientGroup to the list of the currents recipe ingredient.
    this.addIngredientGroupForm.reset();

    // Add the ingredient Group to the list of group to create when saving the recipe
    const newIngredientGroup =
      this.ingredientGroupService.addIngredientGroupToCreate(ingredientGroup);

    // Initialize and add the groupData for the new ingredient group
    // this.addRow(newIngredientQuantity, groupData);
    const groupData = this.initGroupData(newIngredientGroup, []);
    this.groupDataList.push(groupData);
  }

  deleteIngredientGroup(toDeleteGroupData: GroupData): void {
    // Check if the group is empty, return if not
    if (toDeleteGroupData.ingredientQuantityList.length > 0) {
      return;
    }

    this.groupDataList.splice(this.groupDataList.indexOf(toDeleteGroupData), 1);

    const toDeleteIngredientGroup = toDeleteGroupData.ingredientGroup;
    // Remove the group by calling the API
    this.ingredientGroupService.addIngredientGroupToDelete(
      toDeleteIngredientGroup
    );
  }

  updateIngredientGroup(groupData: GroupData): void {
    // Only send a creation request if the form is valid and modified
    if (
      !groupData.updateIngredientGroupNameForm.valid ||
      !groupData.updateIngredientGroupNameForm.dirty
    ) {
      return;
    }

    // Retrieve the form values to create the updated entity
    const updatedIngredientGroup = Object.assign({}, groupData.ingredientGroup);

    updatedIngredientGroup.title =
      groupData.updateIngredientGroupNameForm.value;

    // Add the created ingredientQuantity to the list of the currents recipe ingredient.
    this.ingredientGroupService.addIngredientGroupToUpdate(
      updatedIngredientGroup
    );
  }

  // getIngredientQuantityOfGroup(
  //   ingredientGroup: IngredientGroup
  // ): IngredientQuantity[] {
  //   return this.ingredientQuantityList.filter(
  //     (ingredientQuantity) =>
  //       ingredientQuantity.ingredientGroup == ingredientGroup.id
  //   );
  // }

  compareFn(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  onGroupListDrop(event: CdkDragDrop<GroupData>) {
    // Swap the group around
    moveItemInArray(
      this.groupDataList,
      event.previousIndex,
      event.currentIndex
    );
    // Update the rank of each ingredient quantity if needed and push them to be updated
    this.ingredientGroupService.updateRank(
      this.groupDataList.map((groupData) => groupData.ingredientGroup)
    );
  }

  onListDrop(event: CdkDragDrop<GroupData>) {
    const currentGroupData = event.container.data;
    if (event.previousContainer === event.container) {
      // Swap the formGroup around
      this.moveItemInFormArray(
        currentGroupData.form.get("ingredientQuantity") as FormArray,
        event.previousIndex + 1,
        event.currentIndex + 1
      );
      // Swap the filter observable around
      moveItemInArray(
        currentGroupData.filteredIngredientListObservableList,
        event.previousIndex,
        event.currentIndex
      );
      moveItemInArray(
        currentGroupData.ingredientQuantityValueChangesSubscriptionList,
        event.previousIndex,
        event.currentIndex
      );

      // Swap the elements around
      moveItemInArray(
        currentGroupData.ingredientQuantityList,
        event.previousIndex,
        event.currentIndex
      );

      // Update the rank of each ingredient quantity if needed and push them to be updated
      this.ingredientQuantityService.updateRank(
        currentGroupData.ingredientQuantityList
      );

      // Force the render of the table because its representation is updated only
      // when we push a new data table (ingredientQuantityList) and never if it's modified in place
      this.table.forEach((matTable) => {
        matTable.renderRows();
      });
    } else {
      const previousGroupData = event.previousContainer.data;
      // Swap the formGroup around
      this.transferItemBetweenFormArray(
        previousGroupData.form.get("ingredientQuantity") as FormArray,
        currentGroupData.form.get("ingredientQuantity") as FormArray,
        event.previousIndex + 1,
        event.currentIndex + 1
      );
      // Swap the filter observable around
      transferArrayItem(
        previousGroupData.filteredIngredientListObservableList,
        currentGroupData.filteredIngredientListObservableList,
        event.previousIndex,
        event.currentIndex
      );
      transferArrayItem(
        previousGroupData.ingredientQuantityValueChangesSubscriptionList,
        currentGroupData.ingredientQuantityValueChangesSubscriptionList,
        event.previousIndex,
        event.currentIndex
      );

      //Swap the elements from on list to the other
      transferArrayItem(
        previousGroupData.ingredientQuantityList,
        currentGroupData.ingredientQuantityList,
        event.previousIndex,
        event.currentIndex
      );

      // Update the group of each ingredient quantity if needed and push them to be updated in both list
      this.ingredientQuantityService.updateGroup(
        currentGroupData.ingredientQuantityList,
        currentGroupData.ingredientGroup
      );
      this.ingredientQuantityService.updateGroup(
        previousGroupData.ingredientQuantityList,
        previousGroupData.ingredientGroup
      );

      // Update the rank of each ingredient quantity if needed and push them to be updated in both list
      this.ingredientQuantityService.updateRank(
        currentGroupData.ingredientQuantityList
      );
      this.ingredientQuantityService.updateRank(
        previousGroupData.ingredientQuantityList
      );

      // Force the render of the table because its representation is updated only
      // when we push a new data table (ingredientQuantityList) and never if it's modified in place
      // TODO : Only update the two modified Table
      this.table.forEach((matTable) => {
        matTable.renderRows();
      });
    }
  }

  hasRequiredError(groupData: GroupData): boolean {
    for (const [key, formGroup] of Object.entries(
      (groupData.form.get("ingredientQuantity") as FormArray).controls
    )) {
      if (key == "0") {
        continue;
      }
      for (const value of Object.values((formGroup as FormGroup).controls)) {
        if (value.errors?.["required"]) {
          return true;
        }
      }
    }

    let hasError = false;
    let hasValid = false;
    for (const value of Object.values(groupData.addIngredientForm.controls)) {
      if (value.errors?.["required"]) {
        hasError = true;
      } else {
        hasValid = true;
      }
    }
    return hasError && hasValid;
  }

  hasPatternError(groupData: GroupData): boolean {
    for (const formGroup of Object.values(
      (groupData.form.get("ingredientQuantity") as FormArray).controls
    )) {
      if ((formGroup as FormGroup).controls["quantity"].errors?.["pattern"]) {
        return true;
      }
    }
    return groupData.addIngredientForm.controls["quantity"].errors?.["pattern"];
  }

  changeComaToPoint(row: UntypedFormGroup) {
    row.controls["quantity"].setValue(
      row.controls["quantity"].value.replaceAll(",", ".")
    );
  }

  /**
   * Moves an item in a FormArray to another position.
   * @param formArray FormArray instance in which to move the item.
   * @param fromIndex Starting index of the item.
   * @param toIndex Index to which he item should be moved.
   */
  moveItemInFormArray(
    fromArray: FormArray,
    fromIndex: number,
    toIndex: number
  ): void {
    const temp = fromArray.at(fromIndex);
    fromArray.removeAt(fromIndex);
    fromArray.insert(toIndex, temp);
  }

  transferItemBetweenFormArray(
    fromArray: FormArray,
    toArray: FormArray,
    fromIndex: number,
    toIndex: number
  ): void {
    const temp = fromArray.at(fromIndex);

    if (toIndex >= toArray.length) {
      toArray.push(temp);
    } else {
      toArray.insert(toIndex, temp);
    }

    fromArray.removeAt(fromIndex);
  }
}

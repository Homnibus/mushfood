import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from "@angular/core";
import {
  Ingredient,
  IngredientGroup,
  IngredientQuantity,
  MeasurementUnit,
  Recipe,
} from "../../app.models";
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  first,
  map,
  Observable,
  startWith,
  Subscription,
} from "rxjs";
import { RecipeService } from "../../recipe/services/recipe.service";
import { IngredientQuantityService } from "../../ingredient/services/ingredient-quantity.service";
import { IngredientService } from "../../ingredient/services/ingredient.service";
import { MeasurementUnitService } from "../../ingredient/services/measurement-unit.service";
import { IngredientQuantityMentionService } from "../../ingredient/services/ingredient-quantity-mention.service";
import {
  FormControl,
  FormGroup,
  UntypedFormBuilder,
  Validators,
} from "@angular/forms";
import { MatLegacyTable as MatTable } from "@angular/material/legacy-table";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { flyInOutTransition } from "src/app/shared/fly-in-out.animation";
import { IngredientGroupService } from "src/app/ingredient/services/ingredient-group.service";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { RecipeAddGroupDialogComponent } from "../recipe-add-group-dialog/recipe-add-group-dialog.component";

export class IngredientRowData {
  ingredientQuantity: IngredientQuantity;
  ingredientQuantityForm: FormGroup;
  filteredIngredientListObservable: Observable<Ingredient[]>;
  ingredientQuantityValueChangesSubscription: Subscription;
}

export class GroupData {
  ingredientGroup: IngredientGroup;
  updateIngredientGroupNameForm: FormControl;
  ingredientGroupNameValueChangesSubscription: Subscription;
  ingredientRowDataList: IngredientRowData[] = [];
  addIngredientRowData: IngredientRowData;

  getIngredientQuantityList(): IngredientQuantity[] {
    return this.ingredientRowDataList.map(
      (ingredientRowData) => ingredientRowData.ingredientQuantity
    );
  }
}

@Component({
  selector: "app-recipe-update-ingredient",
  templateUrl: "./recipe-update-ingredient.component.html",
  styleUrls: ["./recipe-update-ingredient.component.scss"],
  animations: [flyInOutTransition],
})
export class RecipeUpdateIngredientComponent implements OnInit, OnDestroy {
  recipe: Recipe;
  groupDataList: GroupData[] = [];
  ingredientList: Ingredient[];
  measurementUnitList: MeasurementUnit[];

  isLoaded = false;
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
  @ViewChildren("addQuantityInputField")
  addQuantityInputField: QueryList<ElementRef>;
  readonly modalWidth = "250px";

  constructor(
    private recipeService: RecipeService,
    private ingredientGroupService: IngredientGroupService,
    public ingredientService: IngredientService,
    public ingredientQuantityService: IngredientQuantityService,
    public measurementUnitService: MeasurementUnitService,
    public ingredientQuantityMentionService: IngredientQuantityMentionService,
    private fb: UntypedFormBuilder,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Retrieve the active recipe
    this.recipeService.activeRecipe$.pipe(first()).subscribe((activeRecipe) => {
      this.recipe = activeRecipe;

      // Initialize the GroupDataList
      combineLatest([
        this.ingredientQuantityService.initActiveIngredientQuantityList(
          activeRecipe,
          true
        ),
        this.ingredientGroupService.initActiveIngredientGroupList(
          activeRecipe,
          true
        ),
      ]).subscribe(([ingredientQuantityList, ingredientGroupList]) => {
        // Create a GroupData for each ingredient group
        ingredientGroupList.forEach((ingredientGroup) => {
          // Filter the ingredient quantity corresponding to the ingredient group
          const filteredIngredientQuantityList =
            this.ingredientQuantityService.getIngredientQuantityOfGroup(
              ingredientQuantityList,
              ingredientGroup.getId()
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
    });

    // Retrieve the active ingredient list
    this.ingredientService
      .initActiveIngredientList()
      .subscribe((activeIngredientList) => {
        this.ingredientList = activeIngredientList;
      });

    //Retrieve the active measurement unit list
    this.measurementUnitService
      .initMeasurementUnitList()
      .subscribe((activeMeasurementUnityList) => {
        this.measurementUnitList = activeMeasurementUnityList;
      });
  }

  ngOnDestroy(): void {
    this.groupDataList.forEach((groupData) => {
      groupData.ingredientGroupNameValueChangesSubscription.unsubscribe();
      groupData.ingredientRowDataList.forEach((ingredientRowData) => {
        this.destroyIngredientRowData(ingredientRowData);
      });
    });
  }

  /**
   * Initialize the GroupData structure which will contain all needed object to manage the forms
   * @param ingredientGroup The ingredient group link to the GroupData
   * @param ingredientQuantityList List of the ingredient quantity linked to the ingredient group
   * @returns The new and initialized GroupData
   */
  initGroupData(
    ingredientGroup: IngredientGroup,
    ingredientQuantityList: IngredientQuantity[]
  ): GroupData {
    // Create the group data and add the Ingredient Group
    const groupData = new GroupData();
    groupData.ingredientGroup = ingredientGroup;

    // Create and add the update form control
    groupData.updateIngredientGroupNameForm = this.fb.control(
      ingredientGroup.title,
      [Validators.required]
    );
    // Add the subscription to the changes on the form value
    groupData.ingredientGroupNameValueChangesSubscription =
      groupData.updateIngredientGroupNameForm.valueChanges
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe(() => this.updateIngredientGroup(groupData));

    // Create and add the add ingredient form
    groupData.addIngredientRowData = this.initIngredientRowData();

    // Initialize a ingredientRowData and add it to the groupData for each ingredient group
    groupData.ingredientRowDataList = ingredientQuantityList.map(
      (ingredientQuantity: IngredientQuantity) =>
        this.initIngredientRowData(ingredientQuantity)
    );

    return groupData;
  }

  /**
   * Initialize the IngredientRowData structure which will contain all needed object to manage the form
   * the ingredientQuantity can be undefine to init an empty ingredientRowData
   * @param ingredientQuantity The ingredient quantity link to the IngredientRowData
   * @returns The new and initialized IngredientRowData
   */
  initIngredientRowData(
    ingredientQuantity?: IngredientQuantity
  ): IngredientRowData {
    // Create the ingredient row data and add the ingredient quantity
    const ingredientRowData = new IngredientRowData();
    if (ingredientQuantity != undefined) {
      ingredientRowData.ingredientQuantity = ingredientQuantity;
    }
    // Create en add the form group to update the ingredient quantity
    ingredientRowData.ingredientQuantityForm = this.fb.group({
      ingredient: [ingredientQuantity?.ingredient, Validators.required],
      quantity: [
        ingredientQuantity?.quantity,
        [
          Validators.required,
          Validators.pattern(
            "^(\\d{1,6}|\\d{1,5}[\\.,]\\d|\\d{1,4}[\\.,]\\d{2})$"
          ),
        ],
      ],
      measurementUnit: [
        ingredientQuantity?.measurementUnit,
        Validators.required,
      ],
    });

    // Create the observable for the ingredient name autocomplete
    ingredientRowData.filteredIngredientListObservable =
      ingredientRowData.ingredientQuantityForm
        .get("ingredient")
        .valueChanges.pipe(
          // Needed to create the ingredient filtered list before the user start using the input.
          startWith(ingredientQuantity?.ingredient?.name),
          map((ingredient) =>
            this.ingredientService.filterIngredientList(
              ingredient,
              this.ingredientList
            )
          )
        );

    // If the ingredient quantity is provided, listen to value change
    if (ingredientQuantity != undefined) {
      // Subscribe to the change of value of the form to automatically update the local representation of the ingredient quantity
      ingredientRowData.ingredientQuantityValueChangesSubscription =
        ingredientRowData.ingredientQuantityForm.valueChanges
          .pipe(debounceTime(500), distinctUntilChanged())
          .subscribe(() => {
            this.changeComaToPoint(ingredientRowData.ingredientQuantityForm);
            this.updateIngredientQuantity(ingredientRowData);
          });
    }
    return ingredientRowData;
  }

  /**
   * Manage the destruction of a ingredientRowData before it can be deleted
   * @param ingredientRowData The ingredientRowData that need to be deleted
   */
  destroyIngredientRowData(ingredientRowData: IngredientRowData): void {
    ingredientRowData.ingredientQuantityValueChangesSubscription.unsubscribe();
  }

  /**
   * Retrieve the information from the creation form of a given GroupData
   * and send a creation request data to the ingredient quantity service
   * @param groupData The GroupData in which to create a new ingredient quantity
   */
  addIngredientQuantity(groupData: GroupData): void {
    // Retrieve the creation form
    const addIngredientForm =
      groupData.addIngredientRowData.ingredientQuantityForm;
    // Only send a creation request if the form is valid.
    if (!addIngredientForm.valid || !addIngredientForm.dirty) {
      return;
    }
    // Change coma to point in the Quantity part of the form
    this.changeComaToPoint(addIngredientForm);

    // Initialize a new ingredientQuantity and the set the form values
    const toCreateIngredientQuantity = new IngredientQuantity();
    // Link the ingredient quantity to the ingredient group and use the temp ID if the ingredient group is not yet created
    toCreateIngredientQuantity.ingredientGroup =
      groupData.ingredientGroup.getId();
    toCreateIngredientQuantity.quantity =
      addIngredientForm.get("quantity").value;
    toCreateIngredientQuantity.measurementUnit =
      addIngredientForm.get("measurementUnit").value;

    // Retrieve the ingredient value from the form and create a new one if it don't exist yet
    const formIngredient = addIngredientForm.get("ingredient").value;
    toCreateIngredientQuantity.ingredient =
      this.getOrCreateIngredient(formIngredient);

    // Send the new local ingredient quantity to the ingredient quantity service and let it manage the creation with the backend
    const createdIngredientQuantity =
      this.ingredientQuantityService.addIngredientQuantityToCreate(
        toCreateIngredientQuantity
      );
    // Initialize and add the new IngredientRowData to the GroupData
    groupData.ingredientRowDataList.push(
      this.initIngredientRowData(createdIngredientQuantity)
    );

    // Reset the form to allow the user to create other ingredient quantity
    addIngredientForm.reset();

    // Focus on the first field of the form to allows the input of a new ingredient quantity
    const creationFormIndex = this.groupDataList.findIndex(
      (toFindGroupData) =>
        toFindGroupData.ingredientGroup.getId() ===
        groupData.ingredientGroup.getId()
    );
    this.addQuantityInputField.get(creationFormIndex).nativeElement.focus();

    // Redraw the table as the data changed but the array was updated on place
    this.updateTableRepresentation(groupData);
  }

  /**
   * Retrieve the information from the update form of a given ingredient quantity
   * and send an update request to the ingredient quantity service
   * @param ingredientRowData The ingredientRowData containing the ingredient quantity to update and it's update form
   */
  updateIngredientQuantity(ingredientRowData: IngredientRowData): void {
    // Get the ingredient quantity form to work on
    const ingredientQuantityForm = ingredientRowData.ingredientQuantityForm;
    // Get the local value of the ingredient quantity to update
    const toUpdateIngredientQuantity = ingredientRowData.ingredientQuantity;

    // Only send a creation request if the form is valid and modified
    if (!ingredientQuantityForm.valid || !ingredientQuantityForm.dirty) {
      return;
    }

    // Retrieve the form values to create the updated entity
    ingredientRowData.ingredientQuantity.quantity =
      ingredientQuantityForm.get("quantity").value;
    ingredientRowData.ingredientQuantity.measurementUnit =
      ingredientQuantityForm.get("measurementUnit").value;

    // Retrieve the ingredient value from the form and create a new one if it don't exist yet
    const formIngredient = ingredientQuantityForm.get("ingredient").value;
    ingredientRowData.ingredientQuantity.ingredient =
      this.getOrCreateIngredient(formIngredient);

    // Send the ingredientQuantity to the ingredient quantity service to let it manage the backend update
    this.ingredientQuantityService.addIngredientQuantityToUpdate(
      ingredientRowData.ingredientQuantity
    );

    // Update the mentions of the local representation of the recipe if it's needed
    const mentionUpdated = this.ingredientQuantityMentionService.updateMention(
      ingredientRowData.ingredientQuantity,
      this.recipe
    );
    // If the mention was updated, send the recipe to the recipe service to let it manage the backend update
    if (mentionUpdated) {
      this.recipe = this.recipeService.addRecipeInstructionsToUpdate(
        this.recipe.instructions
      );
    }
  }

  /**
   * Delete a given local ingredient quantity and send a deletion request to the ingredient quantity service
   * @param toDeleteIngredientRowData The ingredientRowData containing the ingredient quantity to delete
   */
  deleteIngredientQuantity(toDeleteIngredientRowData: IngredientRowData): void {
    // Get the GroupData from the local list
    const groupData = this.groupDataList.find(
      (groupData) =>
        groupData.ingredientGroup.getId() ===
        toDeleteIngredientRowData.ingredientQuantity.ingredientGroup
    );

    // Get the position of the ingredientRowData to delete in the groupData
    const rowDataIndex = groupData.ingredientRowDataList.findIndex(
      (ingredientRowData) =>
        ingredientRowData.ingredientQuantity.getId() ===
        toDeleteIngredientRowData.ingredientQuantity.getId()
    );

    // Prepare the deletion of the ingredientRowData
    this.destroyIngredientRowData(toDeleteIngredientRowData);

    // Remove the corresponding ingredientRowData from the groupData
    groupData.ingredientRowDataList.splice(rowDataIndex, 1);

    // Send the ingredient quantity to the service to let it manage the deletion with the backend
    this.ingredientQuantityService.addIngredientQuantityToDelete(
      toDeleteIngredientRowData.ingredientQuantity
    );

    // Redraw the table as the data changed but the array was updated on place
    this.updateTableRepresentation(groupData);
  }

  /**
   * Use the value of the ingredient of a form to return an ingredient from the local list of ingredient
   * or a new one, that will be created by the ingredient service, if it does not exist.
   * @param formIngredient The value of an ingredient form
   * @returns An Ingredient that can be used in a IngredientQuantity
   */
  getOrCreateIngredient(formIngredient: Ingredient | string): Ingredient {
    if (formIngredient instanceof Ingredient) {
      return formIngredient;
    } else {
      // Check if the ingredient already exist in the local list
      const ingredient = this.ingredientList.find(
        (listIngredient) =>
          listIngredient.name.trim().toLowerCase() ===
          formIngredient.trim().toLowerCase()
      );
      // If it exist in the list, use it
      if (ingredient) {
        return ingredient;
        // Otherwise, create a new one which will be manage by the ingredient quantity service when updating the ingredient quantity
      } else {
        const newIngredient = new Ingredient();
        newIngredient.name = formIngredient;
        return newIngredient;
      }
    }
  }

  /**
   * Retrieve the information from the group creation form and send a creation request to the ingredient group service
   */
  addIngredientGroup(): void {
    // Open a modal to get the new group name
    const dialogRef = this.matDialog.open(RecipeAddGroupDialogComponent, {
      width: this.modalWidth,
    });

    dialogRef.afterClosed().subscribe((groupTitle) => {
      // Initialize a new ingredientGroup and the set the form values
      const toCreateIngredientGroup = new IngredientGroup();
      toCreateIngredientGroup.title = groupTitle;
      //     this.addIngredientGroupForm.get("title").value;
      toCreateIngredientGroup.recipe = this.recipe.id;

      // Add the ingredient Group to the list of group to create when saving the recipe
      const newIngredientGroup =
        this.ingredientGroupService.addIngredientGroupToCreate(
          toCreateIngredientGroup
        );

      // Initialize and add the groupData for the new ingredient group
      const groupData = this.initGroupData(newIngredientGroup, []);
      this.groupDataList.push(groupData);
    });
  }

  /**
   * Retrieve the information from the update form of a given ingredient group
   * and send an update request to the ingredient group service
   * @param toUpdateGroupData The groupData containing the ingredient group to update and it's update form
   */
  updateIngredientGroup(toUpdateGroupData: GroupData): void {
    // Only send a creation request if the form is valid and modified
    if (
      !toUpdateGroupData.updateIngredientGroupNameForm.valid ||
      !toUpdateGroupData.updateIngredientGroupNameForm.dirty
    ) {
      return;
    }

    // Retrieve the form values to the updated entity
    toUpdateGroupData.ingredientGroup.title =
      toUpdateGroupData.updateIngredientGroupNameForm.value;

    // Add the created ingredientQuantity to the list of the currents recipe ingredient.
    this.ingredientGroupService.addIngredientGroupToUpdate(
      toUpdateGroupData.ingredientGroup
    );
  }

  /**
   * Delete a given local ingredient group and send a deletion request to the ingredient group service
   * @param toDeleteGroupData The groupData containing the ingredient group to delete
   */
  deleteIngredientGroup(toDeleteGroupData: GroupData): void {
    // Check if the group is empty, return if not
    if (toDeleteGroupData.getIngredientQuantityList().length > 0) {
      return;
    }

    // Remove the groupData from the list
    this.groupDataList.splice(this.groupDataList.indexOf(toDeleteGroupData), 1);

    // Prepare the deletion of the groupData
    toDeleteGroupData.ingredientGroupNameValueChangesSubscription.unsubscribe();

    // Send the ingredient group to the service to let it manage the deletion with the backend
    const toDeleteIngredientGroup = toDeleteGroupData.ingredientGroup;
    this.ingredientGroupService.addIngredientGroupToDelete(
      toDeleteIngredientGroup
    );
  }

  /**
   * Place the ingredientRowData of place in the right groupData ingredientRowData List
   * @param event The event send by the drag and drop cdk containing the current and previous groupData
   */
  onListDrop(event: CdkDragDrop<GroupData>) {
    // Get the groupData in which the ingredientRowData is dropped
    const currentGroupData = event.container.data;

    // If the ingredientRowData is dropped in the same groupData change it's position in the groupData ingredientRowDatalist
    if (event.previousContainer === event.container) {
      //Swap the ingredientRowData around with the build-in function of the angular drag and drop cdk
      moveItemInArray(
        currentGroupData.ingredientRowDataList,
        event.previousIndex,
        event.currentIndex
      );

      // Update the rank of each ingredient quantity if needed and push them to be updated
      this.ingredientQuantityService.updateRankOfIngredientQuantity(
        currentGroupData.getIngredientQuantityList()
      );

      // Force the render of the table because its representation is only updated
      // when we push a new data table (ingredientQuantityList) and never if it's modified in place
      this.updateTableRepresentation(currentGroupData);

      // If the ingredientRowData is dropped in another groupData change it's position in the groupData ingredientRowDatalist
      // and change it's groupData
    } else {
      // Get the groupData from which the ingredientDataRow is picked
      const previousGroupData = event.previousContainer.data;

      //Swap the ingredientRowData around with the build-in function of the angular drag and drop cdk
      transferArrayItem(
        previousGroupData.ingredientRowDataList,
        currentGroupData.ingredientRowDataList,
        event.previousIndex,
        event.currentIndex
      );

      // Update the group of the dropped ingredient quantity and push it to the ingredient quantity service to be updated
      this.ingredientQuantityService.updateGroupOfIngredientQuantity(
        currentGroupData.ingredientRowDataList[event.currentIndex]
          .ingredientQuantity,
        currentGroupData.ingredientGroup
      );

      // Update the rank of each ingredient quantity if needed and push them to be updated in both list
      this.ingredientQuantityService.updateRankOfIngredientQuantity(
        currentGroupData.getIngredientQuantityList()
      );
      this.ingredientQuantityService.updateRankOfIngredientQuantity(
        previousGroupData.getIngredientQuantityList()
      );

      // Force the render of the table because its representation is updated only
      // when we push a new data table (ingredientQuantityList) and never if it's modified in place
      this.updateTableRepresentation(currentGroupData);
      this.updateTableRepresentation(previousGroupData);
    }
  }

  /**
   * Place the ingredientRowData of place in the right groupData ingredientRowData List
   * @param event The event send by the drag and drop cdk containing the current and previous groupData
   */
  onGroupListDrop(event: CdkDragDrop<GroupData>) {
    // Swap the group around
    moveItemInArray(
      this.groupDataList,
      event.previousIndex,
      event.currentIndex
    );
    // Update the rank of each ingredient group if needed and push them to be updated
    this.ingredientGroupService.updateRankOfIngredientGroup(
      this.groupDataList.map((groupData) => groupData.ingredientGroup)
    );
  }

  /**
   * Update the table representation of a given group data
   * @param groupData the group data linked to the table to redraw
   */
  updateTableRepresentation(groupData: GroupData): void {
    const tableIndex = this.groupDataList.findIndex(
      (toFindGroupData) =>
        toFindGroupData.ingredientGroup.getId() ===
        groupData.ingredientGroup.getId()
    );
    this.table.get(tableIndex).renderRows();
  }

  /**
   * Return true if the group data as any required error in his ingredientRowData
   * or if the ingredient quantity form need to be completed
   * @param groupData The group data to check for required error
   * @returns The value of the check
   */
  hasRequiredError(groupData: GroupData): boolean {
    // Loop over the ingredientRowData ingredient quantity form and search for required error
    for (const ingredientRowData of groupData.ingredientRowDataList) {
      for (const control of Object.values(
        ingredientRowData.ingredientQuantityForm.controls
      )) {
        if (control.errors?.["required"]) {
          return true;
        }
      }
    }

    // Also check the creation form if one of the field is filled
    let hasError = false;
    let hasValid = false;
    for (const control of Object.values(
      groupData.addIngredientRowData.ingredientQuantityForm.controls
    )) {
      if (control.errors?.["required"]) {
        hasError = true;
      } else {
        hasValid = true;
      }
    }
    return hasError && hasValid;
  }

  /**
   * Return true if the group data as any pattern error in his ingredientRowData
   * @param groupData The group data to check for pattern error
   * @returns The value of the check
   */
  hasPatternError(groupData: GroupData): boolean {
    // Loop over the ingredientRowData ingredient quantity form and search for pattern error
    for (const ingredientRowData of groupData.ingredientRowDataList) {
      if (
        ingredientRowData.ingredientQuantityForm.controls["quantity"].errors?.[
          "pattern"
        ]
      ) {
        return true;
      }
    }
    // Also check the creation form
    return groupData.addIngredientRowData.ingredientQuantityForm.controls[
      "quantity"
    ].errors?.["pattern"];
  }

  /**
   * Change coma for point in the quantity form
   * This allow the user to input coma even if the backend only accept point
   * @param ingredientQuantityForm The ingredient form group in which the quantity need to be updated
   */
  changeComaToPoint(ingredientQuantityForm: FormGroup): void {
    // Get the current value of the quantity in the form of the ingredientRowData
    const currentQuantityFormValue = ingredientQuantityForm
      .get("quantity")
      .value.toString();

    // Change coma by point if there is any
    ingredientQuantityForm
      .get("quantity")
      .setValue(parseFloat(currentQuantityFormValue.replaceAll(",", ".")));
  }

  /**
   * Compare function used by the material select input
   */
  compareFn(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
}

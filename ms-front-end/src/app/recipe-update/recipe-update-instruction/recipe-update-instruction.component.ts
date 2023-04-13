import {
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import * as CustomEditor from "ckeditor5-build-rescodex";
import { Recipe } from "../../app.models";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { Subscription } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  skip,
} from "rxjs/operators";
import {
  FeedItem,
  IngredientQuantityMentionService,
} from "../../ingredient/services/ingredient-quantity-mention.service";
import { RecipeService } from "../../recipe/services/recipe.service";
import { IngredientQuantityService } from "../../ingredient/services/ingredient-quantity.service";

@Component({
  selector: "app-recipe-update-instruction",
  templateUrl: "./recipe-update-instruction.component.html",
  styleUrls: ["./recipe-update-instruction.component.css"],
})
export class RecipeUpdateInstructionComponent implements OnInit, OnDestroy {
  public Editor = CustomEditor;
  recipe: Recipe;
  recipeForm: UntypedFormGroup;
  activeRecipeSubscription: Subscription;
  recipeInstructionFormOnChange: Subscription;
  isCkeditorFocused: boolean = false;

  option = {
    mention: {
      feeds: [
        {
          marker: "#",
          feed: this.getFeedItems.bind(this),
        },
      ],
    },
  };

  constructor(
    private recipeService: RecipeService,
    private ingredientQuantityService: IngredientQuantityService,
    private fb: UntypedFormBuilder,
    private ingredientQuantityMentionService: IngredientQuantityMentionService
  ) {}

  ngOnInit(): void {
    this.activeRecipeSubscription = this.recipeService.activeRecipe$.subscribe(
      (data) => {
        this.recipe = data;
      }
    );
    this.recipeService.activeRecipe$.pipe(first()).subscribe((data) => {
      this.recipeForm = this.fb.group({
        instructions: [data.instructions],
      });
    });
    this.recipeInstructionFormOnChange = this.recipeForm
      .get("instructions")
      .valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((instructions) =>
        this.recipeService.updateActiveRecipeInstruction(instructions)
      );

    this.recipeService.activeRecipe$
      .pipe(
        skip(1),
        filter((data) => !this.isCkeditorFocused)
      )
      .subscribe((data) => {
        this.recipeForm.get("instructions").setValue(data.instructions);
      });
  }

  ngOnDestroy(): void {
    this.activeRecipeSubscription.unsubscribe();
    this.recipeInstructionFormOnChange.unsubscribe();
  }

  getFeedItems(queryText: string) {
    return this.ingredientQuantityService.activeIngredientQuantityList$
      .pipe(
        first(),
        map((ingredientQuantityList) =>
          ingredientQuantityList
            .map((ingredientQuantity) =>
              this.ingredientQuantityMentionService.ingredientQuantityToFeedItem(
                ingredientQuantity
              )
            )
            .filter((feedItem) => this.isFeedItemMatching(feedItem, queryText))
            .slice(0, 10)
        )
      )
      .toPromise();
  }

  isFeedItemMatching(feedItem: FeedItem, queryText: string): boolean {
    const searchString = queryText.toLowerCase();
    return feedItem.id.toLowerCase().includes(searchString);
  }

  onCkeditorFocus(): void {
    this.isCkeditorFocused = true;
  }

  onCkeditorBlur(): void {
    this.isCkeditorFocused = false;
  }
}

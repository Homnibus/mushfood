import { Component, OnDestroy, OnInit } from "@angular/core";
import * as CustomEditor from "ckeditor5-build-rescodex";
import { FormControl } from "@angular/forms";
import { Subscription, firstValueFrom } from "rxjs";
import { debounceTime, distinctUntilChanged, first, map } from "rxjs/operators";
import {
  FeedItem,
  IngredientQuantityMentionService,
} from "../../ingredient/services/ingredient-quantity-mention.service";
import { RecipeService } from "../../recipe/services/recipe.service";
import { IngredientQuantityService } from "../../ingredient/services/ingredient-quantity.service";

@Component({
  selector: "app-recipe-update-instruction",
  templateUrl: "./recipe-update-instruction.component.html",
  styleUrls: ["./recipe-update-instruction.component.scss"],
})
export class RecipeUpdateInstructionComponent implements OnInit, OnDestroy {
  editor = CustomEditor;
  recipeForm: FormControl<string>;
  recipeInstructionFormOnChangeSubscription: Subscription;
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
    private ingredientQuantityMentionService: IngredientQuantityMentionService
  ) {}

  ngOnInit(): void {
    // The active recipe is already initialized in the parent tab component
    this.recipeService.activeRecipe$.pipe(first()).subscribe((activeRecipe) => {
      this.recipeForm = new FormControl(activeRecipe.instructions);
    });

    this.recipeInstructionFormOnChangeSubscription =
      this.recipeForm.valueChanges
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe((instructions) =>
          this.recipeService.addRecipeInstructionsToUpdate(instructions)
        );

    // The instruction also need to be updated when the mentions are changed by another component
    // TODO : trouver un moyen plus saint de faire cette vérification
    this.recipeService.updatedRecipe$.subscribe((updatedRecipe) => {
      if (this.isCkeditorFocused) {
        return;
      }
      this.recipeForm.setValue(updatedRecipe.instructions);
    });
  }

  ngOnDestroy(): void {
    this.recipeInstructionFormOnChangeSubscription.unsubscribe();
  }

  /**
   * Return a promise of a list of FeedItem by listing all the ingredients that match the input text
   * @param queryText The text to mach
   * @returns  A promise of a list of FeedItem
   */
  getFeedItems(queryText: string): Promise<FeedItem[]> {
    return firstValueFrom(
      this.ingredientQuantityService.activeIngredientQuantityList$.pipe(
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
    );
  }

  /**
   * Return true if a feed item match a input text
   * @param feedItem The item feed to check
   * @param queryText The text to mach
   * @returns True if the text match the feed item
   */
  isFeedItemMatching(feedItem: FeedItem, queryText: string): boolean {
    const searchString = queryText.toLowerCase();
    return feedItem.id.toLowerCase().includes(searchString);
  }

  /**
   * Tag the editor as focus
   */
  onCkeditorFocus(): void {
    this.isCkeditorFocused = true;
  }

  /**
   * Tag the editor as unfocus
   */
  onCkeditorBlur(): void {
    this.isCkeditorFocused = false;
  }
}

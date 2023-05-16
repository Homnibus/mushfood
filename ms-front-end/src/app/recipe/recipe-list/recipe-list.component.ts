import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { RecipeService } from "../services/recipe.service";
import { Category, Recipe } from "../../app.models";
import { AuthService } from "../../core/services/auth.service";
import { ResizedEvent } from "angular-resize-event";
import { MatDialog } from "@angular/material/dialog";
import { RecipeAddDialogComponent } from "../recipe-add-dialog/recipe-add-dialog.component";
import { environment } from "../../../environments/environment";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { HoneyService, Position } from "../../shared/services/honey.service";
import { UntypedFormBuilder } from "@angular/forms";
import { RecipePaginationService } from "../services/recipe-pagination.service";
import { map } from "rxjs/operators";
import { CategoryService } from "src/app/category/services/category.service";

@Component({
  selector: "app-recipe-list",
  templateUrl: "./recipe-list.component.html",
  styleUrls: ["./recipe-list.component.scss"],
})
export class RecipeListComponent implements OnInit {
  readonly itemSize = 190;
  // List of size that need to recalculate the margin needed to make the honey comb
  readonly breakPoint = [380, 570, 760];
  readonly addRecipeImgUrl = `url(${environment.staticUrl}img/add-recipe.png)`;
  readonly modalWidth = "250px";
  readonly lastRecipeSize = 10;
  // Target element to scroll to after the user use the search
  @ViewChild("recipeListDiv") recipeListDiv: ElementRef;

  recipeList: Recipe[];
  recipeListHexagon: Position[];
  categoryList: Category[];
  categorySelectedList: boolean[];
  honeyCombDivWidth = 0;
  searchForm = this.fb.group({
    searchWords: [""],
  });
  flashOn = false;

  constructor(
    private fb: UntypedFormBuilder,
    private recipeService: RecipeService,
    private categoryService: CategoryService,
    private recipePaginationService: RecipePaginationService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private honeyService: HoneyService,
    public authService: AuthService
  ) {}

  private static isInSameInterval(
    x: number,
    y: number,
    intervalList: number[]
  ): boolean {
    let intervalStart = 0;
    for (const intervalEnd of intervalList) {
      if (x < intervalEnd && y < intervalEnd) {
        break;
      } else {
        intervalStart = intervalEnd;
      }
    }
    return x >= intervalStart && y >= intervalStart;
  }

  ngOnInit() {
    const categoryListFromURL = [].concat(
      this.route.snapshot.queryParamMap
        .get("category")
        ?.toLowerCase()
        .split(",")
    );
    this.categoryService.initCategoryList().subscribe((categoryList) => {
      this.categoryList = categoryList;
      this.categorySelectedList = this.categoryList.map((category) => {
        return categoryListFromURL.indexOf(category.name) >= 0;
      });

      const searchWords = this.route.snapshot.queryParamMap.get("search");
      if (searchWords) {
        this.searchForm.get("searchWords").setValue(searchWords);
      }
      const numberOfRecipeToFetch = this.authService.currentUser
        ? this.lastRecipeSize - 1
        : this.lastRecipeSize;
      this.recipePaginationService
        .filteredList(
          this.getFilterString(searchWords),
          1,
          numberOfRecipeToFetch
        )
        .pipe(map((paginationContainer) => paginationContainer.results))
        .subscribe((recipeList) => {
          this.recipeList = recipeList;
          // Format the margin of the honey like shape containing the recipes
          this.initHoneyComb();
          this.recipeListHexagon = this.honeyService.makeHoney(
            this.recipeListHexagon,
            this.itemSize,
            this.honeyCombDivWidth
          );
        });
    });
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({ behavior: "smooth" });
  }

  flashRecipes(): void {
    this.flashOn = true;
    setTimeout(() => {
      this.flashOn = false;
    }, 300);
  }

  createRecipe() {
    const dialogRef = this.dialog.open(RecipeAddDialogComponent, {
      width: this.modalWidth,
    });
  }

  onResized(event: ResizedEvent) {
    if (
      !RecipeListComponent.isInSameInterval(
        this.honeyCombDivWidth,
        event.newRect.width,
        this.breakPoint
      )
    ) {
      this.recipeListHexagon = this.honeyService.makeHoney(
        this.recipeListHexagon,
        this.itemSize,
        event.newRect.width
      );
    }
    this.honeyCombDivWidth = event.newRect.width;
  }

  onSearch(): void {
    const searchWords = this.searchForm.get("searchWords").value;
    this.searchRecipes(searchWords);
  }

  getIndexForRecipeList(index: number): number {
    if (this.authService.currentUser) {
      return index + 1;
    }
    return index;
  }

  selectCategory(index: number) {
    this.categorySelectedList[index] = !this.categorySelectedList[index];
  }

  private searchRecipes(searchWords: string): void {
    this.recipeService
      .filteredList(this.getFilterString(searchWords))
      .subscribe((recipeList) => {
        const oldRecipeListSize = this.recipeList.length;
        // Sort the recipe list regarding the title.
        this.recipeList = recipeList.sort((x, y) =>
          x.title.toLowerCase() > y.title.toLowerCase()
            ? 1
            : x.title.toLowerCase() < y.title.toLowerCase()
            ? -1
            : 0
        );
        // If the number of recipe as change, the honey comb need to be updated
        if (this.recipeList.length !== oldRecipeListSize) {
          // Format the margin of the honey like shape containing the recipes
          this.initHoneyComb();
          this.recipeListHexagon = this.honeyService.makeHoney(
            this.recipeListHexagon,
            this.itemSize,
            this.honeyCombDivWidth
          );
        }
        setTimeout(() => {
          this.scroll(this.recipeListDiv.nativeElement);
          this.flashRecipes();
        }, 10);
      });
  }

  private getFilterString(searchWords: string): string {
    const queryParams: Params = {};
    let filterString = `logical_delete=false`;
    if (searchWords) {
      filterString = `${filterString}&search=${searchWords}`;
      queryParams.search = searchWords;
    }
    const categoryListFormatted = this.categoryList
      .filter((value, index) => this.categorySelectedList[index])
      .map((category) => category.name)
      .join(",");
    if (categoryListFormatted) {
      filterString = `category__name=${categoryListFormatted}&${filterString}`;
      queryParams.category = categoryListFormatted;
    }
    this.router.navigate([], { relativeTo: this.route, queryParams });
    return filterString;
  }

  private initHoneyComb() {
    this.recipeListHexagon = this.recipeList.map(() => Position.Middle);
    // add a first item to the recipeListHexagon to simulate the add recipe button
    if (this.authService.currentUser) {
      this.recipeListHexagon.unshift(Position.Middle);
    }
  }
}

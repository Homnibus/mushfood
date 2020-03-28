import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RecipeImageUpdateComponent} from './recipe-image-update.component';

describe('RecipeImageUpdateComponent', () => {
  let component: RecipeImageUpdateComponent;
  let fixture: ComponentFixture<RecipeImageUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecipeImageUpdateComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeImageUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

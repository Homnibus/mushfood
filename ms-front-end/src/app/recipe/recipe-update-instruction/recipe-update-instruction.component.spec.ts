import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RecipeUpdateInstructionComponent} from './recipe-update-instruction.component';

describe('RecipeUpdateInstructionComponent', () => {
  let component: RecipeUpdateInstructionComponent;
  let fixture: ComponentFixture<RecipeUpdateInstructionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecipeUpdateInstructionComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeUpdateInstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

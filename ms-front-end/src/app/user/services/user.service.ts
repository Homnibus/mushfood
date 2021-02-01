import {ModelService} from '../../core/services/model.service';
import {Category, ModelState, Recipe, RecipeImage, UserProfile} from '../../app.models';
import {AuthService} from '../../core/services/auth.service';
import {RecipeSerializer, UserProfileSerializer} from '../../app.serializers';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {Validators} from "@angular/forms";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class UserService extends ModelService<UserProfile> {

  constructor(authService: AuthService) {
    super(
      authService,
      UserProfile,
      new UserProfileSerializer()
    );
  }

}

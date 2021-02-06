import {AuthGuard} from '../core/guard/auth.guard';
import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {UserProfileComponent} from './user-profile/user-profile.component';
import {RegistrationComponent} from "./registration/registration.component";
import {RegistrationValidationComponent} from "./registration-validation/registration-validation.component";
import {AdminGuard} from "../core/guard/admin.guard";
import {RegistrationAcknowledgmentComponent} from "./registration-acknowledgment/registration-acknowledgment.component";

const routes: Routes = [
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'registration',
    component: RegistrationComponent,
  },
  {
    path: 'registration-acknowledgment',
    component: RegistrationAcknowledgmentComponent,
  },
  {
    path: 'registration-validation',
    component: RegistrationValidationComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {
}

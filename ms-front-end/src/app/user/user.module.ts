import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserRoutingModule} from './user-routing.module';
import {SharedModule} from "../shared/shared.module";
import { RegistrationComponent } from './registration/registration.component';
import { RegistrationValidationComponent } from './registration-validation/registration-validation.component';
import { RegistrationAcknowledgmentComponent } from './registration-acknowledgment/registration-acknowledgment.component';
import {RecaptchaModule} from "ng-recaptcha";


@NgModule({
  declarations: [
    UserProfileComponent,
    RegistrationComponent,
    RegistrationValidationComponent,
    RegistrationAcknowledgmentComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule,
    RecaptchaModule,
  ],
})
export class UserModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserRoutingModule} from './user-routing.module';
import {SharedModule} from "../shared/shared.module";


@NgModule({
  declarations: [
    UserProfileComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule,
  ]
})
export class UserModule { }

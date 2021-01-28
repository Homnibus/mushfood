import {NgModule} from '@angular/core';
import {LoginComponent} from './login/login.component';
import {LogoutComponent} from './logout/logout.component';
import {SharedModule} from '../shared/shared.module';
import {ErrorModule} from './error/error.module';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {NavigationComponent} from './navigation/navigation.component';
import { FontComponent } from './font/font.component';


@NgModule({
  declarations: [
    LoginComponent,
    LogoutComponent,
    NavigationComponent,
    FontComponent,
  ],
  imports: [
    SharedModule,
    ErrorModule,
    RouterModule,
    HttpClientModule,
  ],
  exports: [
    NavigationComponent,
    FontComponent,
  ],
})
export class CoreModule {
}

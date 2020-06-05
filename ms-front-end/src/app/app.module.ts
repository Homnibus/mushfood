import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {CoreModule} from './core/core.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ErrorRoutingModule} from './core/error/error-routing.module';
import {ErrorInterceptor} from './core/interceptor/error.interceptor';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthInterceptor} from './core/interceptor/auth.interceptor';
import {AppRoutingModule} from './app-routing.module';
import {RecipeModule} from './recipe/recipe.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    CoreModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    RecipeModule,
    ErrorRoutingModule,
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

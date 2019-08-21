import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  MatButtonModule, MatCardModule,
  MatCheckboxModule, MatChipsModule,
  MatDialogModule, MatDividerModule,
  MatIconModule, MatInputModule,
  MatListModule, MatRippleModule,
  MatSidenavModule, MatSnackBarModule, MatTabsModule,
  MatToolbarModule, MatTooltipModule
} from '@angular/material';
import {WebPageModule} from './web-page/web-page.module';
import {LayoutModule} from '@angular/cdk/layout';



@NgModule({
  declarations: [],
  imports: [],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatListModule,
    MatRippleModule,
    MatCardModule,
    MatTooltipModule,
    MatInputModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    WebPageModule,
  ],
})
export class SharedModule { }

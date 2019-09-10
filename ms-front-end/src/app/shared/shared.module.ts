import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule, MatCardModule,
  MatCheckboxModule, MatChipsModule,
  MatDialogModule, MatDividerModule, MatGridListModule,
  MatIconModule, MatInputModule,
  MatListModule, MatRippleModule, MatSelectModule,
  MatSidenavModule, MatSnackBarModule, MatTabsModule,
  MatToolbarModule, MatTooltipModule
} from '@angular/material';
import {WebPageModule} from './web-page/web-page.module';
import {LayoutModule} from '@angular/cdk/layout';
import { NoDecimalPipe } from './no-decimal.pipe';



@NgModule({
  declarations: [NoDecimalPipe],
  imports: [],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    NoDecimalPipe,
    MatToolbarModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatListModule,
    MatGridListModule,
    MatRippleModule,
    MatCardModule,
    MatTooltipModule,
    MatInputModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatSelectModule,
    MatAutocompleteModule,
    WebPageModule,
    NoDecimalPipe,
  ],
})
export class SharedModule { }

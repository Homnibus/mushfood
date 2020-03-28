import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {WebPageModule} from './web-page/web-page.module';
import {LayoutModule} from '@angular/cdk/layout';
import {NoDecimalPipe} from './no-decimal.pipe';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatInputModule} from '@angular/material/input';
import {MatRippleModule} from '@angular/material/core';
import {MatChipsModule} from '@angular/material/chips';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTabsModule} from '@angular/material/tabs';
import {MatButtonModule} from '@angular/material/button';
import {CKEditorModule} from '@ckeditor/ckeditor5-angular';

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
    CKEditorModule,
  ],
})
export class SharedModule { }

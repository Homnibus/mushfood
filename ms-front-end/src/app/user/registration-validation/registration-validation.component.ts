import {Component, OnInit} from '@angular/core';
import {RegistrationService} from "../services/registration.service";
import {Registration, User} from "../../app.models";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatTableDataSource} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {forkJoin, Observable} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserService} from "../services/user.service";

@Component({
  selector: 'app-registration-validation',
  templateUrl: './registration-validation.component.html',
  styleUrls: ['./registration-validation.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RegistrationValidationComponent implements OnInit {

  pendingRegistration: MatTableDataSource<Registration> =  new MatTableDataSource<Registration>();
  displayedColumns: string[] = ['select', 'userName', 'firstName', 'lastName', 'email', 'creationDate'];
  expandedElement: PeriodicElement | null;
  selection = new SelectionModel<Registration>(true, []);


  constructor(private registrationService: RegistrationService,
              private userService: UserService,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.registrationService.filteredList('logical_delete=false').subscribe(
      data => {
        this.pendingRegistration = new MatTableDataSource<Registration>(data);
      }
    );
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.pendingRegistration.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.pendingRegistration.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Registration): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  acceptRegistration(): void {
    const createUserObservable: Observable<User>[] = [];
    for (const registration of this.selection.selected) {
      const newUser = new User();
      newUser.userName = registration.userName;
      newUser.firstName = registration.firstName;
      newUser.lastName = registration.lastName;
      newUser.email = registration.email;
      newUser.registrationDate = registration.creationDate;
      createUserObservable.push(this.userService.create(newUser));
    }
    const updateRegistrationObservable: Observable<Registration>[] = [];
    for (const registration of this.selection.selected) {
      registration.logicalDelete = true;
      updateRegistrationObservable.push(this.registrationService.update(registration));
    }
    forkJoin(createUserObservable).subscribe(
      data => {
        forkJoin(updateRegistrationObservable).subscribe();
        this.removeAllSelectedFromData();
        this.snackBar.open('Comptes créés !', 'Close', {duration: 2000,});
      }
    );
    return;
  }

  rejectRegistration(): void {
    if (this.selection.selected.length === 0){
      return;
    }

    const updateRegistrationObservable: Observable<Registration>[] = [];
    for (const registration of this.selection.selected) {
      registration.logicalDelete = true;
      registration.isRejected = true;
      updateRegistrationObservable.push(this.registrationService.update(registration));
    }
    forkJoin(updateRegistrationObservable).subscribe(
      data => {
        this.removeAllSelectedFromData();
        this.snackBar.open('Demandes rejetées.', 'Close', {duration: 2000,});
      }
    );
    return;

  }

  removeAllSelectedFromData(): void {
    this.selection.selected.forEach(
      selectedRegistration => {
        const index = this.pendingRegistration.data.findIndex(reg => reg.id === selectedRegistration.id);
        this.pendingRegistration.data.splice(index, 1);
      }
    );
    this.pendingRegistration._updateChangeSubscription();
    this.selection.clear();
  }
}



export interface PeriodicElement {
  reason: string;
}

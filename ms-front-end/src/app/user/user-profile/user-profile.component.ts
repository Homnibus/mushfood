import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../core/services/auth.service";
import { User, UserPassword } from "../../app.models";
import { UserService } from "../services/user.service";
import {
  AbstractControl,
  UntypedFormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { MatLegacySnackBar as MatSnackBar } from "@angular/material/legacy-snack-bar";
import { PasswordService } from "../services/password.service";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.scss"],
})
export class UserProfileComponent implements OnInit {
  user: User;

  userProfileForm = this.fb.group({
    firstName: [""],
    lastName: [""],
    email: ["", [Validators.email, Validators.required]],
  });

  passwordForm = this.fb.group(
    {
      password: ["", Validators.required],
      password2: ["", Validators.required],
      oldPassword: ["", Validators.required],
    },
    { validators: samePasswordValidator }
  );

  constructor(
    public authService: AuthService,
    private userService: UserService,
    private fb: UntypedFormBuilder,
    private passwordService: PasswordService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    this.userProfileForm.reset({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
    });
  }

  updateUserProfile(): void {
    if (!this.userProfileForm.dirty) {
      return;
    }
    if (this.userProfileForm.invalid) {
      return;
    }
    this.userProfileForm.markAsPristine();
    const updatedUserProfile = new User();
    updatedUserProfile.userName = this.authService.currentUser.userName;
    updatedUserProfile.firstName = this.userProfileForm.get("firstName").value;
    updatedUserProfile.lastName = this.userProfileForm.get("lastName").value;
    updatedUserProfile.email = this.userProfileForm.get("email").value;

    this.userService.update(updatedUserProfile).subscribe((data) => {
      this.user.email = data.email;
      this.user.lastName = data.lastName;
      this.user.firstName = data.firstName;
      this.authService.setCurrentUser(this.user);
      this.snackBar.open("Informations mis à jours !", "Close", {
        duration: 2000,
        panelClass: ["green-snackbar"],
      });
    });

    return;
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }
    const userPassword = new UserPassword();
    userPassword.userName = this.authService.currentUser.userName;
    userPassword.password = this.passwordForm.get("password").value;
    userPassword.password2 = this.passwordForm.get("password2").value;
    userPassword.oldPassword = this.passwordForm.get("oldPassword").value;

    this.passwordService.update(userPassword).subscribe(
      (data) => {
        this.snackBar.open("Mot de passe mis à jours !", "Close", {
          duration: 2000,
          panelClass: ["green-snackbar"],
        });
        this.passwordForm.reset();
      },
      (err) => {
        if (
          err.error?.old_password?.old_password ===
          "Old password is not correct"
        ) {
          this.passwordForm
            .get("oldPassword")
            .setErrors({ invalidPassword: true });
        }
        if (
          err.error?.old_password?.old_password ===
          "This password is too common."
        ) {
          this.passwordForm.get("password").setErrors({ tooCommon: true });
        }
        if (
          err.error?.password.includes("This password is entirely numeric.")
        ) {
          this.passwordForm.get("password").setErrors({ allNumeric: true });
        }
      }
    );
  }
}

export const samePasswordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get("password");
  const password2 = control.get("password2");

  return password && password2 && password.value !== password2.value
    ? { passwordDifferent: true }
    : null;
};

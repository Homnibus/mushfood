import {Component} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {Registration} from "../../app.models";
import {RegistrationService} from "../services/registration.service";
import {Router} from "@angular/router";
import {environment} from '../../../environments/environment';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {

  registrationForm = this.fb.group({
    userName: ['', [Validators.required, Validators.pattern('[a-zA-Z]*')]],
    firstName: ['', ],
    lastName: ['', ],
    email: ['', [Validators.pattern('^[^@\\s]+@[^@\\s\\.]+\\.[^@\\.\\s]+$'), Validators.required]],
    registrationReason: ['', Validators.required],
  });

  isRequestLoading = false;

  captchaResponse: string;
  reCaptchaSiteKey = environment.reCaptchaSiteKey;

  constructor(private fb: FormBuilder,
              private router: Router,
              private registrationService: RegistrationService) { }

  requestRegistration(): void {
    if (!this.registrationForm.dirty){
      return;
    }
    if (this.registrationForm.invalid){
      return;
    }
    this.isRequestLoading = true;

    const registration = new Registration();
    registration.userName = this.registrationForm.get('userName').value;
    registration.firstName = this.registrationForm.get('firstName').value;
    registration.lastName = this.registrationForm.get('lastName').value;
    registration.email = this.registrationForm.get('email').value;
    registration.reason = this.registrationForm.get('registrationReason').value;
    registration.reCaptchaToken = this.captchaResponse;
    this.registrationService.create(registration).subscribe(
      data => {
        this.isRequestLoading = false;
        this.router.navigateByUrl('/registration-acknowledgment');
      },
      err => {
        this.isRequestLoading = false;
        if (err.error?.username?.username === "Username already taken") {
          this.registrationForm.get("userName").setErrors({'usernameTaken': true});
        }
      }
    );
  }

  resolved(captchaResponse: string) {
    this.captchaResponse = captchaResponse;
  }
}

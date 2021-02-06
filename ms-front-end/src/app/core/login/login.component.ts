import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {FormBuilder, Validators} from '@angular/forms';
import {throwError} from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm = this.fb.group({
    userName: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(public authService: AuthService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {
  }

  tryLogin(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.get('userName').value.toLowerCase(), this.loginForm.get('password').value).subscribe(
        user => {
          const nextUrl = this.route.snapshot.queryParamMap.get('next');
          this.router.navigateByUrl(nextUrl);
        },
        err => {
          if (err.status === 400) {
            this.loginForm.setErrors({invalidUserOrPassword: true});
          }
          return throwError(err);
        }
      );
    }
  }
}

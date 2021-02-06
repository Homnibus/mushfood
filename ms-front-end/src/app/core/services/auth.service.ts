import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {User} from '../../app.models';
import {environment} from '../../../environments/environment';
import {UserService} from '../../user/services/user.service';

class TokenData {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public currentUser$: Observable<User>;
  private currentUserSubject: BehaviorSubject<User>;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    ) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUser(): User {
    return this.currentUserSubject.value;
  }

  public setCurrentUser(user): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  public login(username: string, password: string): Observable<User> {
    return this.http.post<TokenData>(environment.authUrl, {username, password})
      .pipe(
        tap( data => {
            const user = new User();
            user.token = data.token;
            this.currentUserSubject.next(user);
          }),
        switchMap(
          () => {
          return this.userService.get(username);
        }),
          map(
            data => {
              if (data.length === 0){
                return null;
              }
              const user = data[0];
              user.token = this.currentUser.token;
              this.setCurrentUser(user);
              return user;
            }
          ),
        );
  }

  public logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(undefined);
  }
}

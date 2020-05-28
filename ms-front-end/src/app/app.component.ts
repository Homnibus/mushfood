import {Component} from '@angular/core';
import {routerTransition} from './shared/web-page/wep-page.animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routerTransition]
})
export class AppComponent {

  constructor() {
  }

  getState(outlet) {
    return outlet.activatedRouteData.state;
  }

  onActivate(event) {
    window.scroll(0,0);
  }

}

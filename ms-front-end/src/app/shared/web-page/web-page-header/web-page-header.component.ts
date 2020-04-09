import {Component, HostBinding, Input} from '@angular/core';

@Component({
  selector: 'app-web-page-header',
  templateUrl: './web-page-header.component.html',
  styleUrls: ['./web-page-header.component.scss']
})
export class WebPageHeaderComponent {

  @Input()
  @HostBinding('class')
  type: string;

  constructor() {
  }

}

import {Component, HostBinding, Input} from '@angular/core';

@Component({
  selector: 'app-web-page-title',
  templateUrl: './web-page-title.component.html',
  styleUrls: ['./web-page-title.component.scss']
})
export class WebPageTitleComponent {

  @Input()
  @HostBinding('class')
  type: string;

  constructor() {
  }

}

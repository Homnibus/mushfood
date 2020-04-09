import {Component, HostBinding, Input} from '@angular/core';

@Component({
  selector: 'app-web-page-subtitle',
  templateUrl: './web-page-subtitle.component.html',
  styleUrls: ['./web-page-subtitle.component.scss']
})
export class WebPageSubtitleComponent {

  @Input()
  @HostBinding('class')
  type: string;

  constructor() {
  }

}

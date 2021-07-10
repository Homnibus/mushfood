import { Component, OnInit } from '@angular/core';
import {StationService} from "../station.service";
import {environment} from "../../../environments/environment";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  frontBowlUrl;

  constructor(public stationService: StationService,
  private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.stationService.init();
    this.frontBowlUrl = this.sanitizer.bypassSecurityTrustUrl(environment.staticUrl+"img/bol-a-matcha-bleu-fonce2.png");
  }


  onMouseUp() {
    this.stationService.activeStation.onMouseUp();
  }

  onMouseDown() {
    this.stationService.activeStation.onMouseDown();
  }

  onMouseLeave() {
    this.stationService.activeStation.onMouseLeave();
  }
}

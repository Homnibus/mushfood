import {Component, OnInit} from '@angular/core';
import {environment} from '../../../environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-font',
  templateUrl: './font.component.html',
  styleUrls: ['./font.component.css']
})
export class FontComponent implements OnInit {

  styleHtml: SafeHtml;

  constructor(private domSanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.styleHtml = this.domSanitizer.bypassSecurityTrustHtml(`<style>
    @font-face {
        font-family: 'Impacto';
        src: url('${environment.fontUrl}font/impact.woff2') format("woff2"),
             url('${environment.fontUrl}font/impact.woff') format("woff"),
             url('${environment.fontUrl}font/impact.otf') format("opentype"),
             url('${environment.fontUrl}font/impact.ttf') format("truetype");
    }
    </style>`);
  }
}

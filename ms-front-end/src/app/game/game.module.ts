import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import {GameRoutingModule} from "./game-routing.module";
import {SharedModule} from "../shared/shared.module";


@NgModule({
  declarations: [
    MainComponent
  ],
  imports: [
    CommonModule,
    GameRoutingModule,
    SharedModule,
  ]
})
export class GameModule { }

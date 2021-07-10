import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

enum StationState {
  Stopped = 'STOPPED',
  Running = 'RUNNING',
  Finished = 'FINISHED',
}

enum StationType {
  Cut = 'cut',
  PlateUp = 'plate-up',
  Weigh = 'weigh',
  Cook = 'cook',
}

abstract class Station{
  goalText: string;
  stateObservable = new BehaviorSubject(StationState.Stopped);
  state: StationState = StationState.Stopped;
  ingredientPieces = 0;
  abstract onMouseDown(): void;
  abstract onMouseUp(): void;
  abstract onMouseLeave(): void;
}

class WeighStation extends Station{
  goalText = '0';
  currentCut = 0;
  goalCut = 30;
  quantity = 0;
  quantityGoal = 250;
  goesUp = true;
  interval;

  startTimer() {
    this.interval = setInterval(() => {
      if (this.goesUp) {
        this.quantity++;
      } else {
        this.quantity--;
      }
      this.goalText = this.quantity.toString();
      this.state = StationState.Running;
      this.stateObservable.next(StationState.Running);
    }, 10);
  }

  pauseTimer() {
    clearInterval(this.interval);
    this.state = StationState.Stopped;
    this.stateObservable.next(StationState.Stopped);
    // If the player stop at the right time, finish the task
    if ((this.quantityGoal * 0.99) < this.quantity && this.quantity <= (this.quantityGoal * 1.01)){
      this.state = StationState.Finished;
      this.stateObservable.next(StationState.Finished);
      this.quantity = 0;
      this.goesUp = true;
      this.goalText = "OK";
    // If the player put to much, go remove some
    } else if ( this.quantity > (this.quantityGoal * 1.01) && this.goesUp){
      this.goesUp = false;
    // If the player remove to much, add again
    } else if ( (this.quantityGoal * 0.99) >= this.quantity && !this.goesUp) {
      this.goesUp = true;
    }
  }

  onMouseUp(): void {
    this.pauseTimer();
  }

  onMouseDown(): void {
    this.startTimer();
  }

  onMouseLeave(): void {
    this.pauseTimer();
  }
}

class CutStation extends Station{
  goalText = 'Rien a couper';
  currentCut = 0;
  goalCut = 20;
  onMouseUp(): void {
    if (this.state === StationState.Stopped || this.state === StationState.Finished ){
      if (this.ingredientPieces === 0 ){
        this.goalText = 'Rien a couper';
        return;
      }
      else {
        this.state = StationState.Running;
        this.ingredientPieces--;
      }
    }
    this.currentCut += 1;
    if (this.currentCut === this.goalCut) {
      this.state = StationState.Finished;
      this.stateObservable.next(StationState.Finished);
      this.currentCut = 0;
      this.goalText = "Ingrédient coupé !";
    } else {
      this.goalText = this.currentCut.toString();
    }
  }

  onMouseDown(): void {
  }

  onMouseLeave(): void {
  }


}

class PlateUpStation extends Station{
  goalText = '0';
  currentCut = 0;
  goalCut = 30;
  onMouseUp(): void {
  }

  onMouseDown(): void {
  }

  onMouseLeave(): void {
  }

}

class CookStation extends Station{
  goalText = '0';
  currentCut = 0;
  goalCut = 30;
  onMouseUp(): void {
  }

  onMouseDown(): void {
  }

  onMouseLeave(): void {
  }

}


@Injectable({
  providedIn: 'root'
})
export class StationService {

  cutStation = new CutStation();
  weighStation = new WeighStation();
  cookStation = new CookStation();
  plateUpStation = new PlateUpStation();
  score = 0;
  activeStationType: StationType = StationType.Weigh;
  activeStation: Station = this.weighStation;

  constructor() { }

  init(): void {
    this.weighStation.stateObservable.subscribe( (state) => {
      if (state === StationState.Finished) {
        this.cutStation.ingredientPieces += 1;
      }
    });
    this.cutStation.stateObservable.subscribe( (state) => {
      if (state === StationState.Finished) {
        this.score += 1;
      }
    });
  }

  activeWeighStation() {
    if (this.activeStationType === StationType.Weigh){
      return;
    }
    this.activeStation = this.weighStation;
    this.activeStationType = StationType.Weigh;
  }

  activeCutStation() {
    if (this.activeStationType === StationType.Cut){
      return;
    }
    this.activeStation = this.cutStation;
    this.activeStationType = StationType.Cut;
  }

  activeCookStation() {
    if (this.activeStationType === StationType.Cook){
      return;
    }
    this.activeStation = this.cookStation;
    this.activeStationType = StationType.Cook;
  }

  activePlateUpStation() {
    if (this.activeStationType === StationType.PlateUp){
      return;
    }
    this.activeStation = this.plateUpStation;
    this.activeStationType = StationType.PlateUp;
  }

}


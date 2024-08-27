import { Component } from '@angular/core';
import { UserInputValues } from '../events/UserInputValues';
import { ArrowModeChangedEvent, Events, UndoEvent } from '../events/Events';

@Component({
  selector: 'mode-select',
  templateUrl: './mode-select.component.html',
  styleUrl: './mode-select.component.css'
})
export class ModeSelectComponent {
  public healMode: boolean = false;
  public stealMode: boolean = false;
  public attackMode: boolean = false;
  public userValues: UserInputValues = UserInputValues.Instance;
  public Undo() {
    Events.gameEvents.undoHappened.emit(new UndoEvent());
  }
  public attackClicked() {
    this.reset();
    Events.arrowModeChanged.emit(new ArrowModeChangedEvent("Attack"));
    this.attackMode = true;
  }
  public stealClicked() {
    this.reset();
    Events.arrowModeChanged.emit(new ArrowModeChangedEvent("Steal"));
    this.stealMode = true;
  }
  public healClicked() {
    this.reset();
    Events.arrowModeChanged.emit(new ArrowModeChangedEvent("Heal"));
    this.healMode = true;
  }
  public cancelClicked() {
    this.reset();
    Events.arrowModeChanged.emit(new ArrowModeChangedEvent("None"));
  }
  public reset() {
    this.healMode = false;
    this.stealMode = false;
    this.attackMode = false;
  }
}

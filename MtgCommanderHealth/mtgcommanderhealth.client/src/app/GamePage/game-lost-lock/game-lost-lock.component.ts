import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Events, KillableChangedEvent } from "../events/Events";

@Component({
  selector: 'game-lost-lock',
  templateUrl: './game-lost-lock.component.html'
})
export class GameLostLockComponent {
  @Input() public killable: boolean = true;
  @Input() public user: string = "unknown";
  toggle() {
    this.killable = !this.killable;
    Events.killableChanged.emit(new KillableChangedEvent(this.user, this.killable));
  }
}

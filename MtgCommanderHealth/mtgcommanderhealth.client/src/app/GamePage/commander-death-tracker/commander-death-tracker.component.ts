import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommanderDeathCountChangedEvent, Events } from "../events/Events";

@Component({
  selector: 'commander-death-tracker',
  templateUrl: './commander-death-tracker.component.html'
})
export class CommanderDeathTrackerComponent {
  @Input() count: number = 0;
  @Input() name!: string;
  increment() {
    this.count++;
    Events.commanderDeathCountChanged.emit(new CommanderDeathCountChangedEvent(this.name, this.count));
  }
  undo() {
    if (this.count > 0) {
      this.count--;
      Events.commanderDeathCountChanged.emit(new CommanderDeathCountChangedEvent(this.name, this.count));
    }
  }
}

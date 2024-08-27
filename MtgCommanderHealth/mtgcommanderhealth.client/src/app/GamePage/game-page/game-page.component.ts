import { Component, Input, ViewChild } from '@angular/core';
import { HealthLayoutComponent } from '../health-layout/health-layout.component';
import { Events } from '../events/Events';
import { AudioCue } from '../events/AudioCue';
@Component({
  selector: 'game-page',
  templateUrl: './game-page.component.html'
})
export class GamePageComponent {
  @ViewChild(HealthLayoutComponent) healths!: HealthLayoutComponent;
  title = 'MtgHealthWeb';
  public users: string[] = [];
  @Input() public addPlayerName: string = "name";
  public removePlayerName!: string;
  public AddUser() {
    this.healths.AddUser(this.addPlayerName);
    this.users = [...this.healths.gameState.names];
  }
  public RemoveUser() {
    this.healths.RemoveUser(this.removePlayerName);
    this.users = [...this.healths.gameState.names];
  }
  public Reset() {
    Events.gameEvents.reset.emit(true);
  }
  public PlayWow() {
    Events.audioCueQueue.emit(AudioCue.Scream);
  }
  public PlayYoink() {
    Events.audioCueQueue.emit(AudioCue.Yoink);
  }
  public PlayCommander() {
    Events.audioCueQueue.emit(AudioCue.CommanderSummoned);
  }
  public PlayNuke() {
    Events.audioCueQueue.emit(AudioCue.Nuke);
  }

}

import { Component } from '@angular/core';
import { Events } from '../GamePage/events/Events';
import { AudioCue } from '../GamePage/events/AudioCue';

@Component({
  selector: 'sound-player',
  templateUrl: './sound-player.component.html',
  styleUrl: './sound-player.component.css'
})
export class SoundPlayerComponent {
  private _soundEnabled: boolean = true;
  public get soundEnabled() {
    return this._soundEnabled;
  }
  public set soundEnabled(value: boolean) {
    this._soundEnabled = value;
    if (!value) {
      for (let [cue, audio] of this.soundMap) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }
  private soundMap = new Map<AudioCue, HTMLAudioElement>([
      [AudioCue.CommanderSummoned, this.makeAudio("/sounds/commander.wav")] as const,
      [AudioCue.Died,              this.makeAudio("/sounds/death.wav")] as const,
      [AudioCue.Healed,            this.makeAudio("/sounds/Heal.wav")] as const,
      [AudioCue.LifeLost,          this.makeAudio("/sounds/lostLife.wav")] as const,
      [AudioCue.Nuke,              this.makeAudio("/sounds/Nuke.wav")] as const,
      [AudioCue.Scream,            this.makeAudio("/sounds/wow.wav")] as const,
      [AudioCue.Yoink,             this.makeAudio("/sounds/yoink.wav")] as const
    ]);
  constructor() {
    Events.audioCueQueue.subscribe(this.playIfAble.bind(this));
    Events.gameEvents.healed.subscribe(e => this.playIfAble(AudioCue.Healed));
    Events.gameEvents.attacked.subscribe(e => this.playIfAble(AudioCue.LifeLost));
    Events.gameEvents.stoleCommander.subscribe(e => this.playIfAble(AudioCue.Yoink));
    //Events.gameEvents.undoHappened.subscribe(e => this.playIfAble(AudioCue.));
  }
  playIfAble(type: AudioCue) {
    if (type && this.soundEnabled) {
      let audio = this.soundMap.get(type);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.play();
      }
    }
  }
  makeAudio(path: string): HTMLAudioElement {
    let audio = new Audio();
    audio.src = path;
    audio.load();
    return audio;
  }
}

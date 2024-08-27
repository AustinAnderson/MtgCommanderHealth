import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SoundPlayerComponent } from './sound-player/sound-player.component';

export class PageTab {
  constructor(public selected: boolean, private pageRefs: PageTab[]) {
    pageRefs.push(this);
  }
  public getClass(): string {
    return this.selected ? "selected" : "unselected";
  }
  public select() {
    for (let i = 0; i < this.pageRefs.length; i++) {
      this.pageRefs[i].selected = false;
    }
    this.selected = true;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private http: HttpClient) { }
  @ViewChild(SoundPlayerComponent) soundPlayer!: SoundPlayerComponent;
  private pages: PageTab[] = [];
  public gamePage = new PageTab(true, this.pages);
  public registerPage = new PageTab(false, this.pages);
  public toggleSound() {
    this.soundPlayer.soundEnabled = !this.soundPlayer.soundEnabled;
  }
  title = 'MtgHealthWeb';
}

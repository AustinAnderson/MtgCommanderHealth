import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HealthCircleComponent } from './GamePage/health-circle/health-circle.component';
import { CircleClusterComponent } from './GamePage/circle-cluster/circle-cluster.component';
import { HealthLayoutComponent } from './GamePage/health-layout/health-layout.component';
import { ModeSelectComponent } from './GamePage/mode-select/mode-select.component';
import { SoundPlayerComponent } from './sound-player/sound-player.component';
import { EventLogComponent } from './GamePage/event-log/event-log.component';
import { CommanderDeathTrackerComponent } from './GamePage/commander-death-tracker/commander-death-tracker.component';
import { GamePageComponent } from './GamePage/game-page/game-page.component';
import { FormsModule } from '@angular/forms';
import { RegisterPageComponent } from './RegisterPage/register-page/register-page.component';

@NgModule({
  declarations: [
    AppComponent,
    HealthCircleComponent,
    CircleClusterComponent,
    HealthLayoutComponent,
    ModeSelectComponent,
    SoundPlayerComponent,
    EventLogComponent,
    CommanderDeathTrackerComponent,
    GamePageComponent,
    RegisterPageComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

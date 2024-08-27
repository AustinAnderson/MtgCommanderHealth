import { Component } from '@angular/core';
import { CommanderData } from '../circle-cluster/circle-cluster.component';
import { GameState } from '../logic/gameState';
import { GameLogic, ToOrFrom } from '../logic/gameLogic';
import { UserInputValues } from '../events/UserInputValues';
import { Events } from '../events/Events';
export interface CircleClusterData {
  mainUser: string;
  arrowData: ArrowData;
  mainUserHealth: number;
  mainCommanderDeathCount: number;
  commanderList: CommanderData[];
  deg: number;
}
//pass a reference to the arrow color to the game logic class
//so it can edit it and changes will show up in binding
export interface SharedArrowColor {
  color: string;
}
export interface ArrowData {
  fromArrow: boolean;
  toArrow: boolean;
  arrowColor: SharedArrowColor;
}
@Component({
  selector: 'health-layout',
  templateUrl: './health-layout.component.html',
  styleUrl: './health-layout.component.css'
})
export class HealthLayoutComponent {
  constructor() {
    Events.gameEvents.reset.subscribe(_ => this.Reset());
  }
  public gameState: GameState = new GameState();//actual data
  public userMap: CircleClusterData[] = [];//binding property
  //map of name to a reference of the bound arrow data object for that name, updating the ArrowData should update binding oneway
  private updateArrowBindingMap: Map<string, ArrowData> = new Map<string, ArrowData>();
  private _arrowColor: SharedArrowColor = { color: "#111" }
  //able to call the necessary methods, just holding a ref to prevent scope issues
  private _logic: GameLogic = new GameLogic(
    this.TryUpdateArrow.bind(this),
    this.ResetArrows.bind(this),
    this._arrowColor,
    this.RenderGameState.bind(this)
  );

  public AddUser(name: string) {
    this.gameState.AddPlayer(name);
    this.RenderGameState();
  }
  public RemoveUser(name: string) {
    this.gameState.RemovePlayer(name);
    this.RenderGameState();
  }
  public Reset() {
    this.gameState.Reset();
    UserInputValues.Instance.reset();
    this.ResetArrows();
    this.RenderGameState();
  }
  private TryUpdateArrow(name: string, toFrom: ToOrFrom, set?: boolean) {
    let shouldSet = set ?? true;
    if (this.updateArrowBindingMap.has(name)) {
      var arrowDataRef = this.updateArrowBindingMap.get(name) as ArrowData;
      if (toFrom === ToOrFrom.from) {
        arrowDataRef.fromArrow = shouldSet;
      }
      else {
        arrowDataRef.toArrow = shouldSet;
      }
    }
  }
  private ResetArrows() {
    this.updateArrowBindingMap.forEach((arrowDataRef, _) => {
      arrowDataRef.fromArrow = false;
      arrowDataRef.toArrow = false;
    });
  }
  private GetOrCreateArrowData(user: string): ArrowData {
    if (!this.updateArrowBindingMap.has(user)) {
      this.updateArrowBindingMap.set(user, { arrowColor: this._arrowColor, fromArrow: false, toArrow: false });
    }
    return this.updateArrowBindingMap.get(user) as ArrowData;
  }
  //convert GameState object to CircleClusterData[] and assign new obj to userMap property triggering render
  //omit node when dead player or not tracked
  RenderGameState() {
    let notDeadYet = this.gameState.names.filter((x, i) => !this.gameState.deathFlags[i]);
    let step = 360 / notDeadYet.length;
    this.userMap = notDeadYet.map((name, angleI) => { 
      let nameNdx = this.gameState.names.indexOf(name);
      let commanderDmgSources = this.gameState.commanderDamage[nameNdx];
      let commanderDispData: CommanderData[] = [];
      for (let i = 0; i < commanderDmgSources.length; i++) {
        if (commanderDmgSources[i].tracked) {
          commanderDispData.push({
            name: this.gameState.names[i],
            health: commanderDmgSources[i].health
          });
        }
      }
      return {
        mainUser: name,
        mainUserHealth: this.gameState.normalDamage[nameNdx],
        mainCommanderDeathCount: this.gameState.commanderDeaths[nameNdx],
        deg: angleI * step,
        commanderList: commanderDispData,
        arrowData: this.GetOrCreateArrowData(name)
      };
    });
  }
  public ellipseScale(angleDeg: number): number {
    const pi = 3.1415926;
    let angleRad = (angleDeg * pi) / 180.0;
    const e = .5;//ecentricity
    const a = 1.1;//scale
    let numerator = ((a * a) * (1 - (e * e)));
    let denom = 1 - (e * e) * Math.cos(angleRad) * Math.cos(angleRad);
    return Math.sqrt(numerator / denom);
  }
}

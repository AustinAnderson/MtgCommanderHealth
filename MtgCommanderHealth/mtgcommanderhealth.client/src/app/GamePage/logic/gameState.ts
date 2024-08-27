import { AudioCue } from "../events/AudioCue";
import { Events } from "../events/Events";

export class Stack<T> {
  public constructor(item: T) {
    this.data.push(item);
  }
  private data: T[] = [];
  public head(): T {
    return this.data[this.data.length - 1];
  }
  public isLast(): boolean {
    return this.data.length == 1;
  }
  public push(value: T) {
    this.data.push(value);
  }
  public pop(){
    if (!this.isLast())
    {
      this.data.pop();
    }
  }
  public popToLast() {
    while (!this.isLast()) {
      this.pop();
    }
  }
}
export interface HealthAndTracked {
  health: number,
  tracked: boolean
}
export class Data {
  public names: string[] = [];
  public commanderDeaths: number[] = [];
  public commanderDamage: HealthAndTracked[][] = [];
  public normalDamage: number[] = [];
  public deathFlags: boolean[] = [];
  public copy() {
    let commanderDamageCopy = [];
    for (let toNdx = 0; toNdx < this.commanderDamage.length; toNdx++) {
      let froms = [];
      for (let fromNdx = 0; fromNdx < this.commanderDamage[toNdx].length; fromNdx++) {
        froms.push({
          health: this.commanderDamage[toNdx][fromNdx].health,
          tracked: this.commanderDamage[toNdx][fromNdx].tracked
        } as HealthAndTracked);
      }
      commanderDamageCopy.push(froms);
    }
    let newData = new Data();
    newData.names = [...this.names];
    newData.commanderDeaths = [...this.commanderDeaths];
    newData.commanderDamage = commanderDamageCopy;
    newData.normalDamage = [...this.normalDamage];
    newData.deathFlags = [...this.deathFlags];
    return newData;
  }
}
export class GameState {
  _data: Stack<Data> = new Stack<Data>(new Data());
  constructor() {
    Events.gameEvents.attacked.subscribe(e => this.DealDamage(e.fromUser, e.toUser, e.total, e.commander));
    Events.gameEvents.healed.subscribe(e => this.Heal(e.user, e.amount));
    Events.gameEvents.stoleCommander.subscribe(e => this.StealCommander(e.victim, e.thief));
    Events.gameEvents.undoHappened.subscribe(_ => this.Undo());
    Events.commanderDeathCountChanged.subscribe(e => {
      let index = this._data.head().names.indexOf(e.user);
      if (index == -1) {
        console.warn(`unknown player '${e.user}' @GameState.commanderDeathCountChanged.subscribe`);
        return;
      }
      this._data.head().commanderDeaths[index] = e.newValue;
    });
  }
  public get names(): readonly string[] {
    return this._data.head().names;
  }
  public get commanderDamage(): readonly HealthAndTracked[][] {
    return this._data.head().commanderDamage;
  }
  public get commanderDeaths(): readonly number[] {
    return this._data.head().commanderDeaths;
  }
  public get normalDamage(): readonly number[] {
    return this._data.head().normalDamage;
  }
  public get deathFlags(): readonly boolean[] {
    return this._data.head().deathFlags;
  }
  public Undo() {
    this._data.pop();
  }

  public AddPlayer(name: string) {
    this._data.head().names.push(name);
    this._data.head().deathFlags.push(false);
    this._data.head().normalDamage.push(40);
    this._data.head().commanderDeaths.push(0);
    if (this._data.head().commanderDamage.length == 0) {
      this._data.head().commanderDamage = [[{tracked: false, health: 20}]];
    }
    else {
      for (let i = 0; i < this._data.head().commanderDamage.length; i++) {
        this._data.head().commanderDamage[i].push({ tracked: true, health: 21 });
      }
      this._data.head().commanderDamage.push(this._data.head().commanderDamage[0].map(x => ({tracked: x.tracked, health: x.health})));
    }
    this.Reset();
  }
  public RemovePlayer(name: string) {
    let index = this._data.head().names.indexOf(name);
    if (index == -1) {
      console.warn(`unknown player '${name}' @RemovePlayer`);
      return;
    }
    this._data.head().deathFlags.splice(index, 1);
    this._data.head().commanderDeaths.splice(index, 1);
    this._data.head().names.splice(index, 1);
    for (let i = 0; i < this._data.head().commanderDamage.length; i++) {
      this._data.head().commanderDamage[i].splice(index, 1);
    }
    this._data.head().commanderDamage.splice(index, 1);
    this._data.head().normalDamage.splice(index, 1);
  }
  public Heal(name: string, amount: number) {
    this._data.push(this._data.head().copy());
    let index = this._data.head().names.indexOf(name);
    if (index == -1) {
      throw new Error(`invalid name '${name}' for Heal`);
    }
    this._data.head().normalDamage[index] += amount;
  }
  public DealDamage(fromName: string, toName: string, normal: number, commander: number) {
    let data: Data = this._data.head();
    this._data.push(data.copy());
    let fromNdx = this._data.head().names.indexOf(fromName);
    if (fromNdx == -1) {
      throw new Error(`invalid fromName '${fromName}' for DealDamage`);
    }
    let toNdx = this._data.head().names.indexOf(toName);
    if (toNdx == -1) {
      throw new Error(`invalid toName '${toName}' for DealDamage`);
    }
    this._data.head().normalDamage[toNdx] -= normal;
    if (this._data.head().normalDamage[toNdx] <= 0) {
      Events.audioCueQueue.emit(AudioCue.Died);
      this._data.head().deathFlags[toNdx] = true;
    }
    this._data.head().commanderDamage[toNdx][fromNdx].health -= commander;
    if (this._data.head().commanderDamage[toNdx][fromNdx].health <= 0) {
      Events.audioCueQueue.emit(AudioCue.Died);
      this._data.head().deathFlags[toNdx] = true;
    }
    for (let toNdx = 0; toNdx < this.commanderDamage.length; toNdx++) {
      for (let fromNdx = 0; fromNdx < this.commanderDamage[toNdx].length; fromNdx++) {
        if (this._data.head().deathFlags[fromNdx]) {
          this.commanderDamage[toNdx][fromNdx].tracked = false;
        }
      }
    }
  }
  public StealCommander(victim: string, thief: string) {
    let victimNdx = this._data.head().names.indexOf(victim);
    if (victimNdx == -1) {
      throw new Error(`invalid victim name '${victim}' for StealCommander`);
    }
    let thiefNdx = this._data.head().names.indexOf(thief);
    if (thiefNdx == -1) {
      throw new Error(`invalid thief name '${thief}' for StealCommander`);
    }
    this._data.head().commanderDamage[victimNdx][victimNdx].tracked = true;
    this._data.head().commanderDamage[thiefNdx][victimNdx].tracked = false;
  }
  public Reset() {
    this._data.popToLast();
    for (let i = 0; i < this._data.head().commanderDeaths.length; i++) {
      this._data.head().commanderDeaths[i] = 0;
    }
    for (let i = 0; i < this._data.head().deathFlags.length; i++) {
      this._data.head().deathFlags[i] = false;
    }
    for (let i = 0; i < this._data.head().normalDamage.length; i++) {
      this._data.head().normalDamage[i] = 40;
    }
    for (let t = 0; t < this._data.head().commanderDamage.length; t++) {
      for (let f = 0; f < this._data.head().commanderDamage[t].length; f++) {
        this._data.head().commanderDamage[t][f].health = 21;
        this._data.head().commanderDamage[t][f].tracked = (f != t);//diag is not shown by default (not stolen yet)
      }
    }
  }
}


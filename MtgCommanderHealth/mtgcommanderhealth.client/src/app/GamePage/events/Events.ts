import { EventEmitter } from "@angular/core";
import { ArrowMode } from "./ArrowMode";
import { AudioCue } from "./AudioCue";

export class UserMouseEnterEvent { constructor(public user: string) { } }
export class UserMouseLeaveEvent { constructor(public user: string) { } }
export class UserClickedEvent { constructor(public user: string) { } }
export class ArrowModeChangedEvent { constructor(public mode: ArrowMode) { } }


export class HealEvent {
  constructor(public user: string, public amount: number) { }
}
export class AttackEvent {
  constructor(public fromUser: string, public toUser: string, public total: number, public commander: number) { }
}
export class StealCommanderEvent {
  constructor(public victim: string, public thief: string) { }
}
export class UndoEvent { }
export class CommanderDeathCountChangedEvent { constructor(public user: string, public newValue: number) { } }
export class GameEventsInternal {
  public undoHappened: EventEmitter<UndoEvent> = new EventEmitter<UndoEvent>();
  public stoleCommander: EventEmitter<StealCommanderEvent> = new EventEmitter<StealCommanderEvent>();
  public attacked: EventEmitter<AttackEvent> = new EventEmitter<AttackEvent>();
  public healed: EventEmitter<HealEvent> = new EventEmitter<HealEvent>();
  public reset: EventEmitter<boolean> = new EventEmitter<boolean>();
}
export class Events {
  public static userMouseOver = new EventEmitter<UserMouseEnterEvent>();
  public static userMouseOut = new EventEmitter<UserMouseLeaveEvent>();
  public static userClicked = new EventEmitter<UserClickedEvent>();
  public static arrowModeChanged = new EventEmitter<ArrowModeChangedEvent>();
  public static audioCueQueue = new EventEmitter<AudioCue>();
  public static commanderDeathCountChanged = new EventEmitter<CommanderDeathCountChangedEvent>();
  public static gameEvents = new GameEventsInternal();
  private constructor() { }
}

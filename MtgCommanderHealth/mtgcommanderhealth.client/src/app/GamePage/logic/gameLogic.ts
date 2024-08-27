import { AudioCue } from "../events/AudioCue";
import { AttackEvent, Events, HealEvent, StealCommanderEvent } from "../events/Events";
import { UserInputValues } from "../events/UserInputValues";
import { SharedArrowColor } from "../health-layout/health-layout.component";
export const ToOrFrom = { to: 'to', from: 'from' } as const;
export type ToOrFrom = typeof ToOrFrom[keyof typeof ToOrFrom]
export type UpdateArrowDelegate = (name: string, direction: ToOrFrom, set?: boolean) => void
export interface State {
  onMouseOver: (user: string) => void;
  onMouseOut: (user: string) => void;
  onClick: (user: string) => void;
}
export class EmptyState implements State {
  public onClick(user: string) { }
  public onMouseOver(user: string) { }
  public onMouseOut(user: string) { }
}
export class GameLogic {
  private fromUser: string | undefined;
  private toUser: string | undefined;
  private state: State = new EmptyState();
  constructor(
    private arrowUpdateFunction: UpdateArrowDelegate,
    private arrowResetFunction: () => void,
    private colorRef: SharedArrowColor,
    private redraw: ()=>void
  ) {
    Events.arrowModeChanged.subscribe(e => {
      this.fromUser = undefined;
      this.toUser = undefined;
      this.arrowResetFunction();
      if (e.mode === "Attack") {
        //todo: change this to bind as class and have css do the actual color
        this.colorRef.color = "#D20103";
        this.state = attackStart;
      }
      else if (e.mode === "Heal") {
        this.colorRef.color = "#60D82F";
        this.state = healStart;
      }
      else if (e.mode === "Steal") {
        this.colorRef.color = "#505050";
        this.state = stealStart;
      }
      else if (e.mode === "None") {
        this.colorRef.color = "#111";
        this.fromUser = undefined;
        this.toUser = undefined;
        this.state = emptyState;
      }
    });
    Events.userMouseOver.subscribe(e => this.state.onMouseOver(e.user));
    Events.userMouseOut.subscribe(e => this.state.onMouseOut(e.user));
    Events.userClicked.subscribe(e => this.state.onClick(e.user));
    //race condition with gamestate doing the role back, but I guess it works for now... need to fixa
    Events.gameEvents.undoHappened.subscribe(_ => this.redraw());
    let emptyState: State = new EmptyState();
    let healStart: State = {
      onClick: (user: string) => {
        if (user == this.toUser) {
          //blocks until all subscribers finish so not a race condition
          Events.gameEvents.healed.emit(new HealEvent(this.toUser, UserInputValues.Instance.healAmount ?? 0));
          this.redraw();
        }
        this.arrowResetFunction();
        this.toUser = undefined;
      },
      onMouseOut: (user: string) => {
        this.arrowResetFunction();
        this.toUser = undefined;
      },
      onMouseOver: (user: string) => {
        this.toUser = user;
        this.arrowUpdateFunction(this.toUser, ToOrFrom.to);
      }
    }
    let attackStart: State = {
      onClick: (user: string) => {
        if (user === this.fromUser) {
          this.state = attackerSet;
        }
        else {
          this.arrowResetFunction();
          this.fromUser = undefined;
        }
      },
      onMouseOut: (user: string) => {
        this.arrowResetFunction();
        this.fromUser = undefined;
      },
      onMouseOver: (user: string) => {
        this.fromUser = user;
        this.arrowUpdateFunction(this.fromUser, ToOrFrom.from);
      }
    }
    let attackerSet: State = {
      onClick: (user: string) => {
        if (!this.fromUser) {
          throw Error("got to attacker set click without fromUser being set");
        }
        if (this.toUser === user) {
          Events.gameEvents.attacked.emit(new AttackEvent(
            this.fromUser!, this.toUser!,
            UserInputValues.Instance.normalDamage ?? 0, UserInputValues.Instance.commanderDamage ?? 0
          ));
          UserInputValues.Instance.commanderDamage = undefined;
          this.arrowUpdateFunction(this.toUser, ToOrFrom.to, false);
          this.redraw();
        }

        this.toUser = undefined;
      },
      onMouseOut: (user: string) => {
        if (user === this.toUser) {
          this.arrowUpdateFunction(this.toUser, ToOrFrom.to, false);
        }
      },
      onMouseOver: (user: string) => {
        this.toUser = user;
        this.arrowUpdateFunction(this.toUser, ToOrFrom.to);
      }
    }
    let stealStart: State = {
      onClick: (user: string) => {
        if (user === this.fromUser) {
          this.state = thiefSet;
        }
        else {
          this.arrowResetFunction();
          this.fromUser = undefined;
        }
      },
      onMouseOut: (user: string) => {
        this.arrowResetFunction();
        this.fromUser = undefined;
      },
      onMouseOver: (user: string) => {
        this.fromUser = user;
        this.arrowUpdateFunction(this.fromUser, ToOrFrom.from);
      }
    }
    let thiefSet: State = {
      onClick: (user: string) => {
        if (!this.fromUser) {
          throw Error("got to attacker set click without fromUser being set");
        }
        if (this.toUser === user) {
          Events.gameEvents.stoleCommander.emit(new StealCommanderEvent(this.toUser, this.fromUser));
          this.redraw();
        }

        this.fromUser = undefined;
        this.toUser = undefined;
        this.arrowResetFunction();
        this.state = emptyState;
      },
      onMouseOut: (user: string) => {
        if (user === this.toUser) {
          this.arrowUpdateFunction(this.toUser, ToOrFrom.to, false);
        }
      },
      onMouseOver: (user: string) => {
        this.toUser = user;
        this.arrowUpdateFunction(this.toUser, ToOrFrom.to);
      }
    }
  }
}

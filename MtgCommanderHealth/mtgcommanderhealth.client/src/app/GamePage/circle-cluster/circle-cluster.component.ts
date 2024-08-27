import { Component, EventEmitter, Input } from '@angular/core';
import { ColorMap } from '../../color-map';
import { Events, UserClickedEvent, UserMouseLeaveEvent, UserMouseEnterEvent } from '../events/Events';

export interface CommanderData {
  name: string;
  health: number;
}
export interface BindingCommanderData {
  name: string;
  health: number;
  rotationDeg: number;
  color: string;
}
@Component({
  selector: 'circle-cluster',
  templateUrl: './circle-cluster.component.html',
  styleUrl: './circle-cluster.component.css'
})
export class CircleClusterComponent {
  constructor() {
    Events.gameEvents.reset.subscribe(_ => this.commanderDeathCount = 0);
  }

  public emitCircleClicked() {
    Events.userClicked.emit(new UserClickedEvent(this._name));
  }
  public emitCircleMousedEnter() {
    Events.userMouseOver.emit(new UserMouseEnterEvent(this._name));
  }
  public emitCircleMousedLeave() {
    Events.userMouseOut.emit(new UserMouseLeaveEvent(this._name));
  }

  @Input() public arrowColor: string = "#111";
  @Input() public fromArrowVisible: boolean = false;
  @Input() public toArrowVisible: boolean = false;
  @Input() public parentRotation: number = 0;

  @Input() public health: number = 40;
  @Input() public commanderDeathCount: number = 0;
  public color: string = "#777777";

  _name: string = "Player1";
  public get name(): string {
    return this._name;
  }
  @Input() public set name(value: string) {
    this._name = value;
    this.color = ColorMap.Instance.GetOrAddUser(this._name);
  }

  _commanderData: CommanderData[] = [];
  get commanderData(): CommanderData[]{
    return this._commanderData;
  }
  @Input('commander-data') public set commanderData(value: CommanderData[]) {
    this._commanderData = value;
    if (this._commanderData.length > 0) {
      let deg = 360 / this._commanderData.length;
      this.bindingData = this._commanderData.map((n, i) => ({
        name: n.name,
        health: n.health,
        color: ColorMap.Instance.GetOrAddUser(n.name),
        rotationDeg: deg * i
      } as BindingCommanderData));
    }
  }
  public bindingData: BindingCommanderData[] = [];
}

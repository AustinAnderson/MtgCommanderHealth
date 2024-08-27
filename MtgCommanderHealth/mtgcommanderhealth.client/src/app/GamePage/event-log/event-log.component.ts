import { Component } from '@angular/core';
import { Events } from '../events/Events';

export class Message {
  public class: string | undefined;
  constructor(public message: string, public struck: boolean = false)
  {
    if (struck) {
      this.class="struck";
    }
  }
}

@Component({
  selector: 'event-log',
  templateUrl: './event-log.component.html',
  styleUrl: './event-log.component.css'
})
export class EventLogComponent {
  constructor() {
    Events.gameEvents.attacked.subscribe(e => {
      if (e.total == 0 && e.commander == 0) {
        return;
      }
      if (e.fromUser == e.toUser) {
        e.toUser = "themself";
      }
      this.undoneMessages = [];
      let msg = `${e.fromUser} attacked ${e.toUser} for ${e.total} damage`;
      if (e.commander) {
        msg += ` (${e.commander} commander)`;
      }
      this.messageList.push(msg);
      this.reRender();
    });
    Events.gameEvents.healed.subscribe(e => {
      if (e.amount == 0) return;
      this.undoneMessages = [];
      this.messageList.push(`${e.user} gained ${e.amount} life`);
      this.reRender();
    });
    Events.gameEvents.stoleCommander.subscribe(e => {
      this.undoneMessages = [];
      this.messageList.push(`${e.thief} stole ${e.victim}'s commander!`);
      this.reRender();
    });
    Events.gameEvents.undoHappened.subscribe(e => {
      let popped = this.messageList.pop();
      if (popped) {
        //this.undoneMessages.splice(0,0,popped);
        this.undoneMessages.push(popped);
        this.reRender();
      }
    });
    Events.gameEvents.reset.subscribe(_ => {
      this.undoneMessages = [];
      this.messageList = [];
      this.reRender();
    });
  }
  private undoneMessages: string[] = [];
  private messageList: string[] = [];
  reRender() {
    this.displayMessages = [];
    for (let i = 0; i < this.undoneMessages.length; i++) { 
      this.displayMessages.push(new Message(this.undoneMessages[i], true));
    }
    for (let i = this.messageList.length - 1; i >= 0; i--) {
      this.displayMessages.push(new Message(this.messageList[i]));
    }
  }
  public displayMessages: Message[] = [];
}

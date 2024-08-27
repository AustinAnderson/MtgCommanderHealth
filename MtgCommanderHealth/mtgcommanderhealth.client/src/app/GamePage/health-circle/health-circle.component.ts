import { Component, Input } from '@angular/core';

@Component({
  selector: 'health-circle',
  templateUrl: './health-circle.component.html',
  styleUrl: './health-circle.component.css'
})
export class HealthCircleComponent {
  @Input() public name: string = "Daniel M";
  @Input() public pxSize: number = 100;
  @Input() public fill: string = "#fff";
  @Input() public health: number = 40;
}

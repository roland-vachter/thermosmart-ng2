import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { e } from '@angular/core/src/render3';

@Component({
  selector: 'humidity',
  templateUrl: './humidity.component.html',
  styleUrls: ['./humidity.component.scss']
})
export class HumidityComponent implements OnInit, OnChanges {
    @Input() value: number;
    @Input() color: string;
    @Input() withIcon: boolean = false;

    private predefinedColor = false;

    constructor() {}

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.color) {
            this.predefinedColor = true;
        }

        if (changes.value) {
            if (!this.predefinedColor) {
                if (changes.value.currentValue < 20) {
                    this.color = 'red';
                } else if (changes.value.currentValue < 30) {
                    this.color = 'orange';
                } else if (changes.value.currentValue < 40) {
                    this.color = 'gold';
                } else if (changes.value.currentValue < 45) {
                    this.color = 'mint';
                } else if (changes.value.currentValue <= 55) {
                    this.color = 'olive';
                } else if (changes.value.currentValue <= 60) {
                    this.color = 'mint';
                } else if (changes.value.currentValue < 70) {
                    this.color = 'gold';
                } else if (changes.value.currentValue < 80) {
                    this.color = 'orange';
                } else {
                    this.color = 'red';
                }
            }
        }
    }
}

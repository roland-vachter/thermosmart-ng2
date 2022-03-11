import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'temperature',
  templateUrl: './temperature.component.html',
  styleUrls: ['./temperature.component.scss']
})
export class TemperatureComponent implements OnInit, OnChanges {
    @Input() value: number;
    @Input() color: string;
    @Input() withIcon: boolean = false;
    @Input() outside = false;

    private predefinedColor = false;

    constructor() {}

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.color) {
            if (changes.color.currentValue) {
                this.predefinedColor = true;
            } else {
                this.predefinedColor = false;
            }
        }

        if (changes.value) {
            if (!this.predefinedColor) {
                if (this.outside) {
                    if (changes.value.currentValue < 5) {
                        this.color = 'steel-blue';
                    } else if (changes.value.currentValue < 10) {
                        this.color = 'cadet-blue';
                    } else if (changes.value.currentValue < 15) {
                        this.color = 'teal';
                    } else if (changes.value.currentValue < 20) {
                        this.color = 'mint';
                    } else if (changes.value.currentValue < 25) {
                        this.color = 'olive';
                    } else if (changes.value.currentValue < 30) {
                        this.color = 'orange';
                    } else {
                        this.color = 'red';
                    }
                } else {
                    if (changes.value.currentValue < 18) {
                        this.color = 'steel-blue';
                    } else if (changes.value.currentValue < 19) {
                        this.color = 'cadet-blue';
                    } else if (changes.value.currentValue < 20) {
                        this.color = 'teal';
                    } else if (changes.value.currentValue < 21) {
                        this.color = 'mint';
                    } else if (changes.value.currentValue < 21.5) {
                        this.color = 'green';
                    } else if (changes.value.currentValue < 23) {
                        this.color = 'olive';
                    } else if (changes.value.currentValue < 25) {
                        this.color = 'dark-olive';
                    } else if (changes.value.currentValue < 27) {
                        this.color = 'gold';
                    } else if (changes.value.currentValue < 29) {
                        this.color = 'orange';
                    } else {
                        this.color = 'red';
                    }
                }
            }
        }
    }
}

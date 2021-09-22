export interface Sensor {
    id: string;
	temperature: number;
	humidity: number;
	active: boolean;
	enabled: boolean;
	label: string;
	tempAdjust: number;
	humidityAdjust: number;
}

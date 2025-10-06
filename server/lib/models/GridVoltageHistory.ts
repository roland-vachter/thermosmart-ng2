import { Schema, model } from 'mongoose';

export interface IGridVoltageHistory {
  datetime: Date;
  gridVoltage: number;
  location: number;
}

const gridVoltageHistorySchema = new Schema<IGridVoltageHistory>({
  datetime: {
    type: Date,
    index: true
  },
  gridVoltage: Number,
  location: {
    type: Number,
    ref: 'Location'
  }
});

gridVoltageHistorySchema.index({datetime: 1});
gridVoltageHistorySchema.set('versionKey', false);

export default model<IGridVoltageHistory>('GridVoltageHistory', gridVoltageHistorySchema);

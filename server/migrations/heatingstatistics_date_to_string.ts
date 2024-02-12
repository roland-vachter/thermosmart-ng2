import initDb from '../lib/services/db';
import moment from 'moment-timezone';
import HeatingStatistics from '../lib/models/HeatingStatistics';

import dotenv from 'dotenv';
dotenv.config();

void (async () => {
  await initDb();

  const allData = await HeatingStatistics
    .find()
    .exec();

  process.stdout.write('\n');

  for (let i = 0; i < allData.length; i++) {
    const data = allData[i];
    try {
      const mDate = moment(data.date.getTime()).tz('Europe/Bucharest');
      data.date = mDate.tz('utc').startOf('day').toDate();
      await data.save();

      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`${i + 1} / ${allData.length}`);
    } catch (e) {
      console.log(e);
    }
  };

  console.log('\nFINISHED');
  process.exit(0);
})();

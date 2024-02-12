import { Response } from 'node-fetch';

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const _importDynamic = new Function('modulePath', 'return import(modulePath)');

export const fetch = async (...args: any): Promise<Response> => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const {default: fetch} = await _importDynamic('node-fetch');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  return fetch(...args);
}

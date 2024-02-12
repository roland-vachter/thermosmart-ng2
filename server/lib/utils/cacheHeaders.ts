import { Response } from 'express';

export const setCache = (res: Response, value: number) => {
	if (process.env.CACHE_ENABLED === 'true') {
		if (value > 0) {
			res.set('Cache-Control', 'public, max-age=' + value);
		} else {
			setNoCache(res);
		}
	} else {
		setNoCache(res);
	}
};

export const setNoCache = (res: Response) => {
	res.set('Cache-Control', 'private, no-cache, no-store');
};

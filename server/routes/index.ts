import { Request, Response, Router } from 'express';
import indexCtrl from '../lib/controllers/indexCtrl';
import loginMiddleware from '../lib/middlewares/login';
import documentationCtrl from '../lib/controllers/documentationCtrl';
import loginCtrl from '../lib/controllers/loginCtrl';

const router = Router();

router.get('/', loginMiddleware, indexCtrl);
router.get('/login', loginCtrl);
router.get('/documentation', documentationCtrl);

router.get('/privacy-policy', (req: Request, res: Response) => {
	res.render('privacy-policy');
});

router.get('/data-deletion', (req: Request, res: Response) => {
	res.render('data-deletion');
});

router.get('/terms-of-service', (req: Request, res: Response) => {
	res.render('terms-of-service');
});

export default router;

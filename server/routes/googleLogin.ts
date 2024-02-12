import { Router } from 'express';
import * as googleLoginCtrl from '../lib/controllers/googleLoginCtrl';

const router = Router();

router.get('/', googleLoginCtrl.auth);

// handle the callback after google has authenticated the user
router.get('/callback', googleLoginCtrl.callback);

router.get('/forbidden', googleLoginCtrl.forbidden);

export default router;

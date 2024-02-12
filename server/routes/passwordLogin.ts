import { Router } from 'express';
import * as passwordLoginCtrl from '../lib/controllers/passwordLoginCtrl';

const router = Router();

router.post('/', passwordLoginCtrl.auth);
router.get('/forbidden', passwordLoginCtrl.forbidden);

export default router;

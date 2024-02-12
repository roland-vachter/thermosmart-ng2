import { Router } from 'express';
import passwordLogin from './routes/passwordLogin';
import googleLogin from './routes/googleLogin';
import api from './routes/api';
import index from './routes/index';

const router: Router = Router();

router.use('/login/password', passwordLogin);
router.use('/login/google', googleLogin);

router.use('/api', api);
router.use('/', index);

export default router;

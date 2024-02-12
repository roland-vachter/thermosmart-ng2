import express, {
  Application,
  NextFunction,
  Request,
  Response,
  json,
  urlencoded
} from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'http';
import cookieParser from 'cookie-parser';
import path from 'path';
import compression from 'compression';
import { deepMerge } from './lib/utils/utils';
import { getOutsideConditions } from './lib/services/outsideConditions';
import session from 'express-session';
import passport from 'passport';
import * as cacheHeaders from './lib/utils/cacheHeaders';
import MongoStore from 'connect-mongo';
import { ErrorWithResponse, ErrorWithStatus, LoginError } from './lib/types/generic';
import router from './router';

type RenderFn = (view: string, options?: object, callback?: (err: Error, html: string) => void) => void;

const ayear = 365 * 24 * 60 * 60 * 1000;

const prodEnv = process.env.ENV === 'prod' ? true : false;

const defaultOptions = {
	assetsBasePath: `/assets`,
	assetsStaticBasePath: `/assets/static`,
	assetsStaticLibBasePath: `/assets/lib`,
	basePath: '/',
	isTest: !prodEnv,
	isProd: prodEnv
};

function initExpress(): Server {
  const app: Application = express();

  app.use(compression());
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  app.use(function (req: Request, res: Response, next: NextFunction) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const _render: RenderFn = res.render;

    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    res.render = function(view: string, viewOptions: object | undefined, fn: ((err: Error, html: string) => void)) {
      const viewModel: object | undefined = deepMerge({}, viewOptions, defaultOptions, { backgroundImage: getOutsideConditions().backgroundImage });
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      _render.call(this, view, viewModel, fn);
    } as RenderFn;

    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    next();
  });

  app.use(`/assets/static/`, express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.CACHE_ENABLED === 'true' ? ayear : 0
  }));
  app.use(`/assets/`, express.static(path.join(__dirname, '../dist'), {
    maxAge: process.env.CACHE_ENABLED === 'true' ? ayear : 0
  }));
  app.use(`/assets/lib/`, express.static(path.join(__dirname, '../node_modules'), {
    maxAge: process.env.CACHE_ENABLED === 'true' ? ayear : 0
  }));

  // Set Template engine to handlebars
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.engine('handlebars', engine());
  app.set('view engine', 'handlebars');

  // Middleware
  app.use(json());
  app.use(urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(session({
    name: 'sess',
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.MONGO_URL || '',
      collectionName: 'sessions',
      autoRemove: 'native'
    }),
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(passport.authenticate('session'));

  app.use('/', router);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    cacheHeaders.setNoCache(res);
    const err = new ErrorWithStatus('Not Found', 404);
    next(err);
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error & ErrorWithResponse & ErrorWithStatus & LoginError, req: Request, res: Response, next: NextFunction) => {
    cacheHeaders.setNoCache(res);

    const isNotProdEnv = app.get('env') === 'development' || !prodEnv;

    if (err.invalidSession) {
      res.clearCookie("sess");
      res.redirect('/login');
      return;
    }

    console.log('ERROR', err);

    if (err.status === 404) {
      res.status(404);
      res.render('error_404');
    } else if (err.type === 'OAuthException' || err.status === 403) {
      res.status(err.status || 403);
      res.render('error_403', {
        message: err.message,
        error: isNotProdEnv ? err : { status: err?.status }
      });
    } else {
      res.status(err.status || 503);
      res.render('error', {
        message: isNotProdEnv ? err.message : 'There was an error.',
        error: isNotProdEnv ? err : { status: err?.status }
      });
    }
  });

  // Init Express
  const PORT: string | number = process.env.PORT || 8080;
  return app.listen(
    PORT,
    // eslint-disable-next-line no-console
    () => console.log(`Server started on port ${PORT}`)
  );
}

export default initExpress;

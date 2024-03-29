require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
// eslint-disable-next-line import/no-unresolved
const {initializeApp, cert} = require('firebase-admin/app');

const Sentry = require('@sentry/node');
const SentryProfiling = require('@sentry/profiling-node');

const serviceAccount = Buffer.from(process.env.SERVICE_ACCOUNT, 'base64').toString();
const bodyParser = require('body-parser');

const swaggerApiDocumentation = require('./swagger/apiDocs.json');

const statusHealthRoute = require('./routes/status-health');
const topicsRouter = require('./routes/topics');
const locationsRouter = require('./routes/locations');
const whoToFollowRouter = require('./routes/whoToFollow');
const usersRouter = require('./routes/users');
const profilesRouter = require('./routes/profiles');
const indexRouter = require('./routes/index');
const feedRouter = require('./routes/feeds');
const domainRouter = require('./routes/domain');
const topicPage = require('./routes/topicPages');
const linkRouter = require('./routes/link');
const linkPostRouter = require('./routes/link-post');
const discovery = require('./routes/discovery');
const auth = require('./middlewares/auth');
const HomeRouter = require('./routes/home');
const mentionRouter = require('./routes/mention');
const configRouter = require('./routes/config');
const adminRouter = require('./routes/adminRouter');
const UploadRouter = require('./routes/upload');

initializeApp({credential: cert(JSON.parse(serviceAccount))});
const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({
      tracing: true
    }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({
      app
    }),
    new SentryProfiling.ProfilingIntegration(),
    new Sentry.Integrations.Postgres()
  ],
  environment: process.env.NODE_ENV,
  // Performance Monitoring
  tracesSampleRate: 0.1, // Capture 100% of the transactions, reduce in production!,
  profilesSampleRate: 0.1
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(cors());
app.disable('x-powered-by');
app.use('/', HomeRouter);
app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false, limit: '50mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/status-health', statusHealthRoute);

app.get('/debug-sentry', () => {
  throw new Error('My first Sentry error!');
});

app.use('/api/v1/admin', adminRouter);

// Please delete it when you start the sprint 3
app.use('/users', usersRouter);
app.use('/topics', topicsRouter);
app.use('/location', locationsRouter);
app.use('/who-to-follow', whoToFollowRouter);
app.use('/profiles', profilesRouter);
app.use('/u', linkRouter);
app.use('/p', linkPostRouter);

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/topics', topicsRouter);
app.use('/api/v1/location', locationsRouter);
app.use('/api/v1/who-to-follow', whoToFollowRouter);
app.use('/api/v1/profiles', profilesRouter);
app.use('/api/v1/feeds', feedRouter);
app.use('/api/v1/domain', domainRouter);
app.use('/api/v1/discovery', discovery);
app.use('/api/v1/u', linkRouter);
app.use('/api/v1/mention', mentionRouter);
app.use('/api/v1/config', configRouter);
app.use('/api/v1/upload', UploadRouter);

app.use(auth.isAuth, topicPage);

const options = {
  swaggerOptions: {
    authAction: {
      JWT: {
        name: 'JWT',
        schema: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: ''
        },
        value: 'Bearer <JWT>'
      }
    }
  }
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerApiDocumentation, options));
app.use('/api/v1', indexRouter);

app.use(Sentry.Handlers.errorHandler());

module.exports = app;

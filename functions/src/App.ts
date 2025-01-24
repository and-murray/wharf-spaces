import admin from 'firebase-admin';
import V1Router from './Routes/v1/route';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import {Request, Response} from 'express';

admin.initializeApp();

const express = require('express');
const cors = require('cors')({origin: true});
const cookieParser = require('cookie-parser')();
export const App = express();

const swaggerDefinition = {
  openapi: '3.0.1',
  info: {
    title: 'MCDBA',
    version: '1.0.0',
    description:
      "API description for MCDBA app, This API describes 3 Firebase Functions. It's important to remember car bookings (including all http methods) should be made against the car API, desk against the desk API and anything else against the API",
  },
  servers: [
    {
      url: 'http://127.0.0.1:5001/murray-apps-dev/europe-west1/deskapi',
      description: 'Emulator Desk API - For DESK BOOKINGS ONLY',
    },
    {
      url: 'http://127.0.0.1:5001/murray-apps-dev/europe-west1/carapi',
      description: 'Emulator Car API - For CAR BOOKINGS ONLY',
    },
    {
      url: 'http://127.0.0.1:5001/murray-apps-dev/europe-west1/api',
      description: 'Emulator API - For NONE Booking Related work',
    },
    {
      url: 'https://europe-west1-murray-apps-dev.cloudfunctions.net/deskapi',
      description: 'Dev/QA Desk API - For DESK BOOKINGS ONLY',
    },
    {
      url: 'https://europe-west1-murray-apps-dev.cloudfunctions.net/carapi',
      description: 'Dev/QA Car API - For CAR BOOKINGS ONLY',
    },
    {
      url: 'https://europe-west1-murray-apps-dev.cloudfunctions.net/api',
      description: 'Dev/QA API - For NONE Booking Related work',
    },
    {
      url: 'https://europe-west1-murray-apps.cloudfunctions.net/deskapi',
      description: 'PROD Desk API - For DESK BOOKINGS ONLY',
    },
    {
      url: 'https://europe-west1-murray-apps.cloudfunctions.net/carapi',
      description: 'PROD Car API - For CAR BOOKINGS ONLY',
    },
    {
      url: 'https://europe-west1-murray-apps.cloudfunctions.net/api',
      description: 'PROD API - For NONE Booking Related work',
    },
  ],
};

const options = {
  failsOnError: true,
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['**/route.ts', '**/booking.model.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

App.use(express.json());
App.use(cors);
App.use(cookieParser);

App.use((req: Request, res: Response<any>, next: Function) => {
  if (
    (req.originalUrl === '/docs' || req.originalUrl === '/docs/') &&
    process.env.FUNCTION_TARGET !== 'api'
  ) {
    if (process.env.FUNCTION_TARGET !== 'api') {
      return res
        .status(403)
        .send('You can only access docs on the api function');
    }
  }
  if (req.originalUrl === '/docs') {
    return res.redirect('docs/');
  }
  next();
});

App.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// V1
App.use('/v1', V1Router);
// V2
App.use('/v2', V1Router);
export default App;

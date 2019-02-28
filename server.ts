


import 'zone.js/dist/zone-node';
import 'reflect-metadata';

const fs = require('fs');
const domino = require('domino');
const rootDir = require('app-root-dir').get();
const template = fs.readFileSync(rootDir+'/dist/browser/index.html').toString();
const win = domino.createWindow(template);
global['window'] = win;

Object.defineProperty(win.document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true
    };
  },
});
global['document'] = win.document;
global['navigator'] = win.navigator;

import {enableProdMode} from '@angular/core';

// Express Engine
import {ngExpressEngine} from '@nguniversal/express-engine';
// Import module map for lazy loading
import {provideModuleMap} from '@nguniversal/module-map-ngfactory-loader';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import {join} from 'path';

import { routes } from './api/routes/index';
import { db } from './api/models/index';

import {JWTverify} from './api/services/jwtService';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();
const path = require('path');

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {AppServerModuleNgFactory, LAZY_MODULE_MAP} = require('./dist/server/main');

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

app.use('/public', express.static('public'));

app.use('/api/v1', (req, res, next)=>{

  
    if (req.originalUrl.indexOf('login') != -1 || req.originalUrl.indexOf('migrate') != -1 || req.originalUrl.indexOf('uiscom') != -1 || req.originalUrl.indexOf('book') != -1 || req.originalUrl.indexOf('cron') != -1 || req.originalUrl.indexOf('registration') != -1){
       next();
    }else{
        if (!req.headers['authorization']){
            return res.status(403).json({ message: 'UNAUTHORIZED_ACCESS' });
        }

        let token = req.headers['authorization'].replace('Bearer ', '');

        if (token) {

            try{
                let authorized_data = JWTverify(token);

                req['user_role'] = authorized_data.user_role;
                req['account_id'] = authorized_data.account_id;
                req['country_code'] = authorized_data.country_code;
                req['language'] = authorized_data.language;
                req['organization_id'] = authorized_data.organization_id;

                setTimeout(() => {

                    next();
                }, 2000 );

                
            }
            catch(e){
                return res.status(403).json({ message: 'BAD_TOKEN' });
            }

        } else {
            return res.status(403).json({ message: 'NO_RIGHT_FORMAT_TOKEN' });
        }
    }
});


app.use(bodyParser.json());
app.use('/api/v1', routes);

// Example Express Rest API endpoints
// app.get('/api/**', (req, res) => { });

// Server static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser'), {
  maxAge: '1y'
}));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render('index', { req });
});


console.log(process.env);
// Start up the Node server
db.sync().then(function () {
  app.listen(PORT, () => {
    console.log(`Node Express server listening on http://localhost:${PORT}`);
  });
});

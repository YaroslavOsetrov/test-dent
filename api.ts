import * as express from 'express';
import * as bodyParser from 'body-parser';
import {join} from 'path';

import { routes } from './api/routes/index';
import { db } from './api/models/index';

import {JWTverify} from './api/services/jwtService';

// Faster server renders w/ Prod mode (dev mode never needed)

// Express server
const app = express();
const path = require('path');

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');

//const {Routes, Database} = require('./server/api');

app.set('view engine', 'html');

app.set('views', 'src');

//app.use('/', express.static('dist', {index: false}));

app.use('/', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);

  /*  if (req.method == 'OPTIONS'){
        res.status(200);
        next();
        return;
    }
*/
    next();
})

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
            return res.status(403).json({ message: 'BAD_TOKEN' });
        }
    }
});


app.use(bodyParser.json());
app.use('/api/v1', routes);



// Start up the Node server
db.sync().then(function () {
  app.listen(PORT, () => {
    console.log(`Node Express server listening on http://localhost:${PORT}`);
  });
});

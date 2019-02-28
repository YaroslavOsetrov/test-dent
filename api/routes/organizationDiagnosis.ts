import {Router, Request, Response, RequestHandler} from 'express';
import * as moment from 'moment';

import {db} from './../models/index';

import {User} from './../models/user/main';
import {Patient} from './../models/user/patient/main';

import * as fs from 'fs';

const router = Router();


router.get('/', (req:Request, res:Response) => {

   fs.readFile(require('app-root-dir').get() + '/public/i18n/icd_codes/' + req['language'] + '.json', 'utf8', (err, data) => {

        res.json(JSON.parse(data));

   });
})

export const organizationDiagnosisRouter = router;
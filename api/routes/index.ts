import {Router, Request, Response} from 'express';

import {ConfigService} from './../services/configService';

import {loginRouter} from './login';
import {registrationRouter} from './registration';

import {loginRecovery} from "./loginRecovery";

import {accountRouter} from './account';
import {accountPhotoRouter} from './accountPhoto';

import {accountAccess} from './accountAccess';

import {organizationRoutes} from './organization';

import {patientsRouter} from './patients';

import {patientRouter} from './patient';

import {apptRouter} from './appt';

import {analyticsRouter} from './analytics';
import {analyticsDailyRouter} from './analyticsDaily';


import {cronRouter} from './.cron';

import {documentRouter} from './document';

import {bookRouter} from './book';

import {workhoursRouter} from './workhours';

import {apptRequestRouter} from './apptRequest';

import {migrateRouter} from './.migrate';

import {uiscomRouter} from './.uiscom';

const router = Router();

router.get('/init', (req, res) => {
    res.json({message:'Ok'});
})

router.use('/uiscom', uiscomRouter);

router.use('/registration', registrationRouter);

router.use('/login', loginRouter);
router.use('/login/recovery', loginRecovery);

router.use('/cron', cronRouter);

router.use('/book', bookRouter);

router.use('/document', documentRouter);


router.use('/apptRequest', apptRequestRouter);

router.use('/migrate', migrateRouter);

router.use('/workhours', workhoursRouter);
router.use('/appt', apptRouter);

router.use('/patients', patientsRouter);
router.use('/patient', patientRouter);

router.use('/account', accountRouter);

router.use('/account/photo', accountPhotoRouter);

router.use('/account/access', accountAccess);

router.use('/organization', organizationRoutes);

router.use('/analyticsDaily/:startDate', analyticsDailyRouter);
router.use('/analytics/:startDate/:endDate', analyticsRouter);

export const routes = router;
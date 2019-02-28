import {Router, Request, Response, RequestHandler} from 'express';

import {Appointment} from './../models/appointment/main';

import {Organization} from './../models/organization/main';

import {OrganizationLimit} from './../models/organization/limit';
import {OrganizationNotification} from './../models/organization/notification';

import {cronApptReminder} from './.cron.ApptReminder';

import {cronEmailCampaign} from './.cron.emailCampaign';

const router = Router();

router.all('/:key*', (req, res, next) => {

    if (req.params.key != 'fdsajksdfaj823h4823fnsnsa82h3912v')
        return res.status(400).json({message:'BAD_REQUEST'});

    next();
});

router.use('/:key/apptReminder', cronApptReminder);

router.use('/:key/emailCampaign', cronEmailCampaign);


export const cronRouter = router;
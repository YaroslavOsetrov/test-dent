import {Router, Request, Response, RequestHandler} from 'express';
import * as moment from 'moment';

import * as urlencode from 'urlencode';

import {db} from './../models/index';

import {User} from './../models/user/main';
import {Patient} from './../models/user/patient/main';

import {PatientTask} from './../models/user/patient/task';

import {i18nService} from './../services/i18nService';

import {OrganizationNotification} from './../models/organization/notification';

const router = Router();

router.all('*', (req, res, next) => {

    OrganizationNotification.findById<OrganizationNotification>(req['organization_id']).then(
        response => {

            req['organization_notification'] = response;


            if (!response){

                let _i18nService:i18nService = new i18nService();

                let notification = _i18nService.getFile('organization_notifications', req['language']);

                OrganizationNotification.create<OrganizationNotification>({
                    create_appt:notification['create_appt'],
                    confirm_appt:notification['confirm_appt'],
                    edit_appt:notification['edit_appt'],
                    upcoming_birthday:notification['upcoming_birthday'],
                    cancel_appt:notification['cancel_appt'],
                    organization_id:req['organization_id']
                }).then(
                    response => {
                        req['organization_notification'] = response;
                        next();
                    }
                ); 
            }else
                next();
        }
    )
})

router.get('/', (req:Request, res:Response) => {

   res.json(req['organization_notification']);
})

router.put('/', (req:Request, res:Response) => {

    req['organization_notification'].updateAttributes({
        create_appt:req.body.create_appt,
        is_create_appt:req.body.is_create_appt,
        confirm_appt:req.body.confirm_appt,
        is_confirm_appt:req.body.is_confirm_appt,
        edit_appt:req.body.edit_appt,
        is_edit_appt:req.body.is_edit_appt,
        cancel_appt:req.body.cancel_appt,
        is_cancel_appt:req.body.is_cancel_appt,
        upcoming_birthday:req.body.upcoming_birthday,
        is_upcoming_birthday:req.body.is_upcoming_birthday,
    });

    res.json({message:'Ok'});

})

export const organizationNotification = router;
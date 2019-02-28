import {Router, Request, Response, RequestHandler} from 'express';

import {Organization} from './../models/organization/main';
import {OrganizationLimit} from './../models/organization/limit';
import {OrganizationSubscription} from './../models/organization/subscription';

import {OrganizationScheduler} from './../models/organization/scheduler';

import {organizationOffice} from './organizationOffice';

import {priceRouter} from './organizationPrice';

import {organizationProcedureRouter} from './organizationProcedure';

import {organizationInventoryRouter} from './organizationInventory';

import {organizationCallRouter} from './organizationCalls';

import {schedulerRouter} from './organizationScheduler';

import {userRouter} from './organizationUser';

import {organizationTaskRouter} from './organizationTask';

import {organizationDiagnosisRouter} from './organizationDiagnosis';

import {organizationSubscription} from './organizationSubscription';

import {organizationRichNoteTemplates} from './organizationRichNoteTemplate';

import {organizationCollaboration} from './organizationCollaboration';

import {organizationInvoiceRouter} from './organizationInvoice';

import {organizationNotification} from './organizationNotification';

import {organizationDocs} from './organizationDocs';

import {organizationLogsRouter} from './organizationLogs';

import {organizationWidgetRouter} from './organizationWidget';

import {organizationCustomField} from './organizationCustomField';

import {organizationPhotoRouter} from './organizationPhoto';

let router = Router();

router.all('*', (req, res, next) => {

    Organization.findById(req['organization_id'], {
        include:[OrganizationLimit, OrganizationSubscription]
    }).then(
        response => {
            req['organization'] = response;
            next();
        }
    )

})

router.get('/', (req:Request, res:Response) => {
    res.json(req['organization']);
})

router.put('/', (req:Request, res:Response) => {

    req['organization'].updateAttributes({
        name:req.body.name,
        phone:req.body.phone,
        address:req.body.address,
        url:req.body.url,
        uni_teeth_scheme:req.body.uni_teeth_scheme,
        tax:req.body.tax,
        email:req.body.email,
        currency_code:req.body.currency_code,
        timezone_offset:req.body.timezone_offset
    });

    OrganizationScheduler.findById(req['organization_id']).then(
        organizationScheduler => {
            organizationScheduler.updateAttributes({
                first_day_index : req.body['first_day_index'],
                start_hour      : req.body['start_hour'],
                end_hour        : req.body['end_hour']
            });
        }
    );
    

    res.json({message:'Ok'});

})

router.use('/photo', organizationPhotoRouter);

router.use('/customFields', organizationCustomField);

router.use('/logs', organizationLogsRouter);

router.use('/richNoteTemplates', organizationRichNoteTemplates);

router.use('/price', priceRouter);

router.use('/users', userRouter);

router.use('/calls', organizationCallRouter);

router.use('/scheduler', schedulerRouter);

router.use('/tasks', organizationTaskRouter);

router.use('/invoices', organizationInvoiceRouter);

router.use('/icd10', organizationDiagnosisRouter);

router.use('/subscription', organizationSubscription);

router.use('/collaboration', organizationCollaboration);

router.use('/notifications', organizationNotification);

router.use('/procedures', organizationProcedureRouter);

router.use('/inventory', organizationInventoryRouter);

router.use('/offices', organizationOffice);

router.use('/docs', organizationDocs);

router.use('/widget', organizationWidgetRouter);

export const organizationRoutes = router;
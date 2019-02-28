import {Router, Request, Response, RequestHandler} from 'express';
import {db} from './../models/index';

import {Patient} from './../models/user/patient/main';

import {User} from './../models/user/main';

import {PatientInvoice} from './../models/user/patient/invoice/main';

import {PatientAccess} from './../models/user/patient/access';

import {OrganizationLimit} from './../models/organization/limit';

import {patientAppt} from './patientAppt';
import {patientApptDetail} from './patientApptDetail';

import {patientTask} from './patientTask';
import {patientTaskDetail} from './patientTaskDetail';

import {patientProcedure} from './patientProcedure';

import {patientPlan} from './patientPlan';

import {patientPlanPrint} from './patientPlanPrint';

import {patientPlanUnassigned} from './patientPlanUnassigned';

import {patientInvoice} from './patientInvoice';
import {patientInvoiceDetail} from './patientInvoiceDetail';

import {patientInvoicePayment} from './patientInvoicePayment';

import {patientProcedureUnbilled} from './patientProcedureUnbilled';

import {patientFile} from './patientFile';

import {patientFileDetail} from './patientFileDetail';

import {patientPrint} from './patientPrint';

import {patientInvoicePrint} from './patientInvoicePrint';

import {patientNote} from './patientNote';
import {patientRichNote} from './patientRichNote';

import {patientDocumentPrint} from './patientDocumentPrint';

import {LogService} from './../services/logService';

import {patientLogRouter} from './patientLog';

const router = Router();

router.all('/:id*', (req, res, next) => {

    let where = {};

    where['id'] = req.params.id;
    where['organization_id'] = req['organization_id'];

    where['$and'] = [];

    if (!req['user_role']['patients'])
        where['$and'].push([{create_user_id:req['account_id']}]);
         

    let includeOptions:any = [{
        model: User
    }, {
        model: PatientAccess
    }];

    Patient.findOne<Patient>({
        include: includeOptions,
        where:where
    }).then(
        response => {

            if (response == null){
                res.status(404).json({message:'PATIENT_NOT_FOUND'});
                return;
            }
             req['patient'] = response;

            db.query('SELECT TOP 1 * FROM StatsPatientDebts WHERE patient_id=:patientId', {
                replacements:{
                    patientId:response.getDataValue('id')
                },
                type: db.Sequelize.QueryTypes.SELECT
            }).then(
                patientDebts => {
                    if (patientDebts){
                        if (patientDebts[0]){
                            if (patientDebts[0]['total_debts'])
                                req['patient'].updateAttributes({
                                    total_debts:patientDebts[0]['total_debts']
                                });
                        }else{
                            req['patient'].updateAttributes({
                                total_debts:0
                            });
                        }
                    }else{
                        
                    }
                   
                }
            )
          

           
            next();
        },
        errors => {
            console.log(errors);
            res.status(400).json({message:'PATIENT_ID_NOT_VALID'});
        }
    )

});

router.use('/:id/documentPrint', patientDocumentPrint);

router.use('/:id/print', patientPrint);

router.use('/:id/tasks', patientTask);

router.use('/:id/task/:taskId', patientTaskDetail);

router.use('/:id/appts', patientAppt);
router.use('/:id/appt/:apptId', patientApptDetail);

router.use('/:id/procedures', patientProcedure);

router.use('/:id/plans', patientPlan);

router.use('/:id/logs', patientLogRouter);

router.use('/:id/plans/:tpId/print', patientPlanPrint);

router.use('/:id/unassignedPlans', patientPlanUnassigned);
router.use('/:id/unbilledProcedures', patientProcedureUnbilled);

router.use('/:id/invoices/', patientInvoice);
router.use('/:id/invoice/:invoiceId', patientInvoiceDetail);

router.use('/:id/invoice/:invoiceId/print', patientInvoicePrint);

router.use('/:id/invoice/:invoiceId/payments', patientInvoicePayment);

router.use('/:id/files', patientFile);

router.use('/:id/file/:fileId', patientFileDetail);

router.use('/:id/notes', patientNote);
router.use('/:id/richNotes', patientRichNote);

router.get('/:id', (req, res, next) => {
    res.json(req['patient']);
});

router.get('/:id/access', (req:Request, res:Response) => {
    PatientAccess.findAll({
        where:{
            patient_id:req['patient'].getDataValue('id')
        }
    }).then(response => {
        res.json(response);
    });
});

router.put('/:id/access', (req:Request, res:Response) => {

    let records:Array<{patient_id:string, user_id:string, is_view:boolean, is_edit:boolean}> = [];

    try{
        req.body.forEach((userId:string) => {
            records.push({patient_id:req['patient'].getDataValue('id'), user_id:userId, is_view:true, is_edit:true});
        });
    }catch(e){
        res.status(400).json({message:'BAD_REQUEST'});
    }
    

    PatientAccess.destroy({
        where:{
            patient_id:req['patient'].getDataValue('id')
        }
    }).then((response) => {

        PatientAccess.bulkCreate<PatientAccess>(records).then(
            (response) => {
                res.json({message:'Ok'});
            }
        )
    });
})

router.put('/:id', (req,res,next) => {
    
    let updateJSONFields = {};
   
    ['allergies', 'medications', 'urgent', 'past_ill', 'current_ill', 'custom_fields', 'dental_chart'].forEach((row) => {

        if (typeof req.body[row] === 'string'){
            updateJSONFields[row] = false;
        }else{
            updateJSONFields[row] = true;
        }
    })

    console.log(updateJSONFields);

    req['patient'].updateAttributes({
        dental_chart:(updateJSONFields['dental_chart']) ? JSON.stringify(req.body['dental_chart']) :req['patient'].getDataValue('dental_chart'),
        is_child:req.body['is_child'],
        is_archived:req.body['is_archived'],
        document_number:req.body['document_number'],
        document_issued:req.body['document_issued'],
        document_expired:req.body['document_expired'],
        document_authority:req.body['document_authority'],
        card_number:req.body['card_number'],
        phone_additional:req.body['phone_additional'],
        reference_from:req.body['reference_from'],
        email:req.body['email'],
        allergies:(updateJSONFields['allergies']) ? JSON.stringify(req.body['allergies']) : req['patient'].getDataValue('allergies'),
        medications:(updateJSONFields['medications']) ? JSON.stringify(req.body['medications']) : req['patient'].getDataValue('medications'),
        urgent:(updateJSONFields['urgent']) ? JSON.stringify(req.body['urgent']) : req['patient'].getDataValue('urgent'),
        past_ill:(updateJSONFields['past_ill']) ? JSON.stringify(req.body['past_ill']) : req['patient'].getDataValue('past_ill'),
        current_ill:(updateJSONFields['current_ill']) ? JSON.stringify(req.body['current_ill']) : req['patient'].getDataValue('current_ill'),
        custom_fields:(updateJSONFields['custom_fields']) ? JSON.stringify(req.body['custom_fields']) : req['patient'].getDataValue('custom_fields')
    });

   
    if (req.body.hasOwnProperty('patient_user'))
        req['patient'].getDataValue('patient_user').updateAttributes({
            fullname:req.body.patient_user.fullname,
            phone:req.body.patient_user.phone,
            birthday:req.body.patient_user.birthday,
            address:req.body.patient_user.address,
        });

    res.json({message:'Ok'});
})

export const patientRouter = router;
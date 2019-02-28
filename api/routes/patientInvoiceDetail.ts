import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';
import {db} from './../models';


import {PatientInvoice} from './../models/user/patient/invoice/main';

import {PatientProcedure} from './../models/user/patient/procedure';

const models = db.models;
const router = Router({mergeParams:true});

import {LogService} from './../services/logService';


router.all('/*', (req, res, next) => {

    PatientInvoice.findOne({
        where:{
            id:req.params.invoiceId,
            patient_id:req['patient']['id']
        }
    }).then(
        response => {
            if (!response){
                res.status(404).json({message:'INVOICE_NOT_FOUND'}); return;
            }
            req['invoice'] = response;
            next();
        },
        errors => {
            res.status(400).json({message:'INVOICE_NOT_FOUND'});
        }
    )

})

router.get('/procedures', (req:Request, res:Response) => {

    PatientProcedure.findAll<PatientProcedure>({
        where:{
            invoice_id:req['invoice']['id']
        }
    }).then(
        response => {
            res.json(response);
        }
    )

})

router.get('/', (req:Request, res:Response) => {
    res.json(req['invoice']);
})

router.put('/', (req:Request, res:Response) => {

    req['invoice'].updateAttributes({
        appointment_date:req.body.appointment_date,
        code:req.body.code,
        expire_date:req.body.expire_date,
        total_amt:req.body.total_amt,
        payed_amt:req.body.payed_amt,
        discount:req.body.discount,
        tax:req.body.tax,
        comment:req.body.comment
    });

    res.json({message:'Ok'});

})

router.delete('/', (req:Request, res:Response) => {

    let toPay = req['invoice'].getDataValue('total_amt') - req['invoice'].getDataValue('total_amt') * req['invoice'].getDataValue('discount') / 100 + req['invoice'].getDataValue('total_amt') * req['invoice'].getDataValue('tax') / 100;

    let totalPaid = 0;
    req['invoice'].get_payments().then(
        (response:any) => {

            PatientProcedure.update({
                invoice_id:null,
                is_billed:false
            }, {
                where:{
                    invoice_id:req['invoice'].getDataValue('id')
                }
            }) 
            response.forEach((row:any) => {
                totalPaid += row['paid_amt'];
                row.destroy(); 
            });

            new LogService({
                resource_id:req['invoice'].getDataValue('id'),
                patient_id:req['patient'].getDataValue('id'),
                type:'invoice_payment_add'
            }).destroy();

            req['patient'].updateAttributes({
                total_debts:req['patient'].getDataValue('total_debts') + totalPaid - toPay
            });

            new LogService({
                patient_id:req['patient'].getDataValue('id'),
                resource_id:req['invoice'].getDataValue('id'),
                type:'invoice_add'
            }).destroy();

            req['invoice'].destroy();
        }
        
    )
    

    res.json({message:'Ok'});

})

export const patientInvoiceDetail = router;
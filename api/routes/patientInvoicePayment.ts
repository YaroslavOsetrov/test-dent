import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';
import {db} from './../models';


import {PatientInvoice} from './../models/user/patient/invoice/main';
import {PatientInvoicePayment} from './../models/user/patient/invoice/payment';


const models = db.models;
const router = Router({mergeParams:true});

import {LogService} from './../services/logService';

router.get('/', (req:Request, res:Response) => {

    req['invoice'].get_payments().then(
        (response:any) => {
            res.json(response);
        }
    )

})
router.post('/', (req:Request, res:Response) => {

    req.body.organization_id = req['organization_id'];
    req.body.create_user_id = req['account_id'];

    let discountedAmt = req['invoice'].getDataValue('discount') * req['invoice'].getDataValue('total_amt') / 100;
    
    let taxAmt = req['invoice'].getDataValue('tax') * req['invoice'].getDataValue('total_amt') / 100;

    let remainedAmt = req['invoice'].getDataValue('total_amt') - discountedAmt - taxAmt - req['invoice'].getDataValue('payed_amt');

    if (remainedAmt <= 0){
        res.status(400).json({message:'ALREADY_PAID'});
        return;
    }

    let newBalanceAmt = remainedAmt - req.body.paid_amt;

    
    let newPaidAmt = (remainedAmt < req.body.paid_amt) ? remainedAmt : req.body.paid_amt;

    req.body.paid_amt = newPaidAmt;
   
    req['invoice'].add_payment(req.body).then(
        (response:any) => {

             new LogService({
                organization_id:req['organization_id'],
                create_user_id:req['account_id'],
                type:'invoice_payment_add',
                resource_id:req['invoice'].getDataValue('id'),
                resource_id_sub:response.getDataValue('id'),
                patient_id:req['patient'].getDataValue('id'),
                data:JSON.stringify({})
            }).add();

            let newDebts = req['patient'].getDataValue('total_debts') - req.body.paid_amt;

            let totalDebts = req['patient'].getDataValue('total_debts') - req.body.paid_amt;

            if (newDebts < 0){
                totalDebts = 0;
            }
            console.log(newBalanceAmt);
            console.log('NEW BALANCE----------------------------------------');
            console.log(req['patient'].getDataValue('balance') + ((newBalanceAmt < 0) ? newBalanceAmt * -1 : 0));

            req['patient'].updateAttributes({
                total_debts:totalDebts,
                balance:req['patient'].getDataValue('balance') + ((newBalanceAmt < 0) ? newBalanceAmt * -1 : 0)
            });

            req['invoice'].updateAttributes({
                payed_amt:req['invoice'].getDataValue('payed_amt') + newPaidAmt
            });
            res.json(response);
        }, (errors:any) => {

        }
    );
});

router.delete('/:id', (req:Request, res:Response) => {

    

    req['invoice'].get_payment(req.params.id).then(
        (response:any) => {

            new LogService({
                organization_id:req['organization_id'],
                resource_id_sub:req.params.id,
                type:'invoice_payment_add'
            }).destroy();

            new LogService({
                organization_id:req['organization_id'],
                create_user_id:req['account_id'],
                type:'invoice_payment_delete',
                resource_id:req['invoice'].getDataValue('id'),
                patient_id:req['patient'].getDataValue('id'),
                data:JSON.stringify({paid_amt:response.getDataValue('paid_amt')})
            }).add();
        
            req['patient'].updateAttributes({
                balance:req['patient'].getDataValue('balance') - response.getDataValue('paid_amt')
            });

            req['invoice'].updateAttributes({
                payed_amt:req['invoice'].getDataValue('payed_amt') - response.getDataValue('paid_amt')
            });

            response.destroy();

            res.json({message:'Ok'});
        }
    )

})

export const patientInvoicePayment = router;
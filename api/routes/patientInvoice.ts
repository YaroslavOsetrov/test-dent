import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';
import {db} from './../models';

import {Appointment} from './../models/appointment/main';

import {PatientInvoice} from './../models/user/patient/invoice/main';

import {PatientInvoicePayment} from './../models/user/patient/invoice/payment';

import {PatientProcedure} from './../models/user/patient/procedure';

import {LogService} from './../services/logService';

const models = db.models;
const router = Router({mergeParams:true});

const addInvoice = (req:Request, res:Response) => {
    
    PatientInvoice.max('internal_number', {
        where:{
            organization_id:req['organization_id']
        }
    }).then(
        maxInternalNumber => {

            if (!maxInternalNumber)
                maxInternalNumber = 0;

            req.body.internal_number = maxInternalNumber + 1;

            let total_amt = 0;
            req.body.invoice_procedures.forEach((procedure:any) => {
                total_amt += procedure.price_fee_adj * procedure.qty;
            });

            req.body.total_amt = total_amt;

            let toPay = req.body.total_amt - req.body.total_amt * req.body.discount / 100 + req.body.total_amt * req.body.tax / 100;
           
            let patientBalance = req['patient'].getDataValue('balance');

            let newPatientBalance = patientBalance - toPay;

            let initPayment = 0;

            if (patientBalance > 0){

                if (newPatientBalance <0){
                    initPayment = patientBalance;
                }else
                    initPayment = toPay;
                
                newPatientBalance = initPayment;
            }else
                newPatientBalance = 0;

            


            if (initPayment > 0){
                req.body.payed_amt = initPayment;
            }else{
                req.body.payed_amt = 0;
            }


            PatientInvoice.create<PatientInvoice>(req.body).then(
                response => {
                    
                    new LogService({
                        organization_id:req['organization_id'],
                        create_user_id:req['account_id'],
                        type:'invoice_add',
                        resource_id:response.getDataValue('id'),
                        patient_id:req['patient'].getDataValue('id'),
                        event_date:response.getDataValue('expire_date'),
                        data:JSON.stringify({})
                    }).add();

                    if (initPayment > 0){
                        PatientInvoicePayment.create<PatientInvoicePayment>({
                            invoice_id:response.getDataValue('id'),
                            paid_amt:initPayment,
                            payment_code:'pay_t.balance',
                            organization_id:req['organization_id'],
                            create_user_id:req['account_id'],
                            patient_id:req['patient'].getDataValue('id')
                        })

                        req['patient'].updateAttributes({
                            total_debts:req['patient'].getDataValue('total_debts') + toPay - initPayment,
                            balance:req['patient'].getDataValue('balance') - initPayment
                        })
                    }else
                        req['patient'].updateAttributes({
                            total_debts:req['patient'].getDataValue('total_debts') + toPay
                        });

                    

                     db.Sequelize.Promise.each(req.body.invoice_procedures, (procedure, index) => {
                        return PatientProcedure.update({
                            invoice_id: response.getDataValue('id'),
                            qty: procedure['qty'],
                            price_fee_adj:procedure['price_fee_adj']
                        },{
                            where:{
                                id: procedure['id']
                            }
                        }).then((user) => {
                        }, (err) => {

                        });
                    })
                    .then((updateAll) => {
                        res.json(response);
                    }, (err) => {

                    });
                },
                errors => {
                    console.log(errors);
                    res.status(400).json({message:'INVALID_INVOICE'});
                }
            )

        }
    )
}
router.get('/', (req:Request, res:Response) => {

    PatientInvoice.findAll<PatientInvoice>({
        where:{
            patient_id:req['patient']['id']
        },
        include:[{
            model:PatientProcedure
        }],
        order: [db.Sequelize.literal('total_amt+tax*total_amt/100-discount*total_amt/100-payed_amt DESC')]
    }).then(
        response => {
            res.json(response);
        }
    )
});

router.get('/topup', (req:Request, res:Response) => {

    PatientInvoicePayment.findAll({
        where:{
            patient_id:req['patient'].getDataValue('id'),
            invoice_id:null
        },
        order:[['createdAt', 'DESC']]
    }).then(response => {
        res.json(response);
    })

})

router.post('/topup', (req:Request, res:Response) => {

    let invoicePayments:Array<any> = [];

    req.body.paid_amt = Number(req.body.paid_amt);

    let paidTotalAmt = req.body.paid_amt;

    PatientInvoice.findAll<PatientInvoice>({
        where:({
            patient_id:req['patient']['id'],
            total_amt:db.Sequelize.literal('(total_amt+tax*total_amt/100)-discount*(total_amt+tax*total_amt/100)/100 - payed_amt>=0')
        } as any)
    }).then(
        response => {

            response.forEach((invoice) => {

                let toPay = Number(Number(invoice.getDataValue('total_amt') + invoice.getDataValue('tax')*invoice.getDataValue('total_amt')/100 - invoice.getDataValue('discount') * (invoice.getDataValue('total_amt')+invoice.getDataValue('tax')*invoice.getDataValue('total_amt')/100)/100 - invoice.getDataValue('payed_amt')).toFixed(2));

                if (paidTotalAmt > 0 && toPay > 0){

                    let invoicePaidAmt = 0;
                    if (toPay <= paidTotalAmt){
                        invoicePaidAmt = toPay;
                    }else{
                        invoicePaidAmt = paidTotalAmt;
                    }
                    

                    invoicePayments.push({invoice_id: invoice.getDataValue('id'), paid_amt:invoicePaidAmt, payment_code:req.body.payment_code, organization_id:req['organization_id'], create_user_id:req['account_id'] })
                    

                    PatientInvoice.update({
                        payed_amt:invoice.getDataValue('payed_amt') + invoicePaidAmt
                    }, {
                        where:{
                            id:invoice.getDataValue('id')
                        }
                    });

                    paidTotalAmt = paidTotalAmt - invoicePaidAmt;
                    
                }
            });

          //  if (paidTotalAmt > 0){
                req['patient'].updateAttributes({
                    balance:req['patient'].getDataValue('balance') + req.body.paid_amt
                })
        //    }

            PatientInvoicePayment.bulkCreate<PatientInvoicePayment>(invoicePayments).then(
                payments => {

                    PatientInvoicePayment.create<PatientInvoicePayment>({
                        invoice_id:null,
                        paid_amt:req.body.paid_amt,
                        payment_code:req.body.payment_code, 
                        organization_id:req['organization_id'], 
                        create_user_id:req['account_id'],
                        patient_id:req['patient'].getDataValue('id')
                    }).then(payment_topup => {
                        res.json({payments:payments, payment_topup:payment_topup});
                    });
                    
                    
                },
                errors => {
                    return res.status(400).json({message:'INVALID_PAYMENTS_DATA'});
                }
            )

        }
    );
})

router.get('/:apptId', (req:Request, res:Response) => {
     PatientInvoice.findAll<PatientInvoice>({
        where:{
            patient_id:req['patient']['id'],
            appointment_id:req.params.apptId
        },
        include:[{
            model:PatientProcedure
        }]
    }).then(
        response => {
            res.json(response);
        }
    )
})

router.get('/unassigned', (req:Request, res:Response) => {

    PatientProcedure.findAll({
        where:{
            patient_id:req['patient']['id'],
            invoice_id:null
        }
    }).then(
        response => {
            res.json(response);
        }
    )

})

router.post('/', (req:Request, res:Response) => {

    req.body.patient_id = req['patient']['id'];
    req.body.organization_id = req['organization_id'];
    req.body.create_user_id = req['account_id'];

    req.body.index = '';

    if (req.body.appointment_id)
        Appointment.findOne<Appointment>({
            where:{
                patient_id:req['patient']['id'],
                id:req.body.appointment_id
            }
        }).then(
            patient_appointment => {
               
                if (patient_appointment == null && req.body.appointment_id){
                    res.status(400).json({message:'INVALID_INVOICE'}); return;
                }
                addInvoice(req, res);

            }
        )
    else
        addInvoice(req, res);
})


export const patientInvoice = router;
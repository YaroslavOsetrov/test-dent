import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';
import {db} from './../models';

import {UserRole} from './../models/user/user_role';
import {User} from './../models/user/main';

import {PatientLog} from './../models/user/patient/log';

import {PatientTask} from './../models/user/patient/task';

import {PatientFile} from './../models/user/patient/file';

import {PatientInvoice} from './../models/user/patient/invoice/main';
import {PatientInvoicePayment} from './../models/user/patient/invoice/payment';

import {Appointment} from './../models/appointment/main';

const models = db.models;
const router = Router({mergeParams:true});

const pageLimit = 50;

router.get('/all/:page', (req:Request, res:Response) => {


    let startPos = Number(req.params.page) * pageLimit;

    PatientLog.findAll({
        where:({
            patient_id:req['patient']['id'],
            event_date:{
                $or:[{
                    $lte:moment.utc().format('YYYY-MM-DD')
                }, {
                    $eq:null
                }]
               
            }
        } as any),
        order: db.Sequelize.literal('createdAt DESC ' + ' OFFSET ' + startPos + '  ROWS FETCH NEXT ' + pageLimit + ' ROWS ONLY')
    }).then(
        response => {
            res.json(response);
        }
    )
});

router.get('/upcoming', (req:Request, res:Response) => {


    PatientLog.findAll({
        where:{
            patient_id:req['patient']['id'],
            event_date:{
                $gt:moment.utc().format('YYYY-MM-DD')
            }
        },
        order: db.Sequelize.literal('event_date DESC')
    }).then(
        response => {
            res.json(response);
        }
    )
});

router.post('/', (req, res) => {
    Promise.all([
        Appointment.findAll({
            where:{
                id:req['body']['appt'],
                patient_id:req['patient'].getDataValue('id')
            }
        }),
        PatientTask.findAll({
            where:{
                id:req['body']['task'],
                patient_id:req['patient'].getDataValue('id')
            }
        }),
        PatientInvoice.findAll({
            where:{
                id:req['body']['invoice'],
                patient_id:req['patient'].getDataValue('id')
            }
        }),
        PatientInvoicePayment.findAll({
            where:{
                id:req['body']['invoice_payment']
            }
        }),
        PatientFile.findAll({
            where:{
                id:req['body']['document'],
                patient_id:req['patient'].getDataValue('id')
            }
        })
    ]).then((response) => {        
        res.json({appt:response[0], task:response[1], invoice:response[2], invoice_payment:response[3], document:response[5], note:response[4]});
    })
})
export const patientLogRouter = router;
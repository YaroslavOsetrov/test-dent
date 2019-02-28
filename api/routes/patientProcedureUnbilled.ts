import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';
import {db} from './../models';

import {Appointment} from './../models/appointment/main';

import {PatientInvoice} from './../models/user/patient/invoice/main';

import {PatientProcedure} from './../models/user/patient/procedure';

const models = db.models;
const router = Router({mergeParams:true});

router.get('/', (req:Request, res:Response) => {
    PatientProcedure.findAll({
        where:{
            patient_id:req['patient']['id'],
            invoice_id: null
        },
        include:[
            Appointment
        ],
        order:db.Sequelize.literal('[appointment.date] DESC')
    }).then(
        response => {
            res.json(response);
        }
    )
});

export const patientProcedureUnbilled = router;
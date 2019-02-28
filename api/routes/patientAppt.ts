import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';
import {db} from './../models';

import {UserRole} from './../models/user/user_role';
import {User} from './../models/user/main';

import {Appointment} from './../models/appointment/main';
import {AppointmentNote} from './../models/appointment/note';

import {LogService} from './../services/logService';

const models = db.models;
const router = Router({mergeParams:true});

router.post('/', (req:Request, res:Response) => {

    req.body.patient_id=req['patient']['id'];
    req.body.organization_id = req['organization_id'];
    req.body.create_user_id = req['account_id'];

    req.body.notify_create = true;
    req.body.notify_before = true;

    UserRole.findOne({
        where:{
            organization_id:req['organization_id'],
            user_id:req.body.provider_id
        }
    }).then(
        response => {

            if (response){
                
                Appointment.create<Appointment>(req.body).then(
                    appointment => {

                        console.log('--------------------------------------------------tttttttttttttttt');
                        new LogService({
                            organization_id:req['organization_id'],
                            create_user_id:req['account_id'],
                            type:'appt_add',
                            resource_id:appointment.getDataValue('id'),
                            patient_id:req['patient'].getDataValue('id'),
                            event_date:appointment.getDataValue('date'),
                            data:JSON.stringify({start_time:appointment.getDataValue('start_time'), end_time:appointment.getDataValue('end_time')})
                        }).add();

                        appointment.create_note({
                            appointment_id:appointment.getDataValue('id'),
                            complaints:'',
                            observations:'',
                            diagnoses:'',
                            treatments:'',
                            recommendations:'',
                            investigations:''
                        });

                        res.json(appointment);
                    }
                ).catch(
                    err => {
                        console.log(err);
                        res.status(400).json({message:'INVALID_DATA'});
                    }
                )

            }

        }
    );
})

router.get('/', (req:Request, res:Response) => {

    Appointment.findAll<Appointment>({
        where : {
            patient_id:req['patient']['id'],
            organization_id:req['organization_id']
        },
        include:[User],
        order:[['date', 'DESC']]
    }).then(
        response => {
            res.json(response);
        }
    )

})

/*
router.all('/:apptId*', (req, res, next) => {

    Appointment.findOne({
        where:{
            id:req.params.apptId,
            patient_id:req['patient']['id']
        }
    }).then(
        response => {
            req['patient_appointment'] = response;
        }
    )


    next();
});

router.get('/:apptId', (req:Request, res:Response) => {
    res.json(req['patient_appointment']);
})*/

export const patientAppt = router;
import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';
import {db} from './../models';

import {UserRole} from './../models/user/user_role';

import {Appointment} from './../models/appointment/main';
import {AppointmentNote} from './../models/appointment/note';

import {LogService} from './../services/logService';
const models = db.models;
const router = Router({mergeParams:true});

router.all('*', (req, res, next) => {

    Appointment.findOne({
        where:{
            id:req.params.apptId,
            patient_id:req['patient']['id']
        },
        include:[AppointmentNote]
    }).then(
        response => {
            req['patient_appointment'] = response;
            next();
        },
        errors => {
            res.status(404).json({message:'APPT_NOT_FOUND'});
        }
    )
   
});

router.get('/', (req:Request, res:Response) => {
    res.json(req['patient_appointment']);
})

router.put('/', (req:Request, res:Response) => {

    let isStatusChanged = (
        (req['patient_appointment'].getDataValue('is_confirmed') != req.body.is_confirmed) ||
        (req['patient_appointment'].getDataValue('is_completed') != req.body.is_completed) || 
        (req['patient_appointment'].getDataValue('is_deleted') != req.body.is_deleted)
    );

    req['patient_appointment'].updateAttributes({
        section_index  : req.body.section_index,
        section_sub_index: req.body.section_sub_index,
        provider_id : req.body.provider_id,
        date        : req.body.date,
        start_time  : req.body.start_time,
        end_time    : req.body.end_time,
        is_confirmed: req.body.is_confirmed,
        is_noshow   : req.body.is_noshow,
        room_id     : req.body.room_id,
        is_deleted  : req.body.is_deleted,
        is_completed: req.body.is_completed,
        notify_create:req.body.notify_create,
        notify_before:req.body.notify_before,
        note:req.body.note
    });


    if (!isStatusChanged)
        new LogService({
            organization_id:req['organization_id'],
            create_user_id:req['account_id'],
            type:'appt_edit',
            resource_id:req['patient_appointment'].getDataValue('id'),
            patient_id:req['patient'].getDataValue('id'),
            data:JSON.stringify({})
        }).add();
    
    if (isStatusChanged){
        let type = 'appt_cancel';

        if (req.body.is_completed){
            type = 'appt_complete';
        }

        new LogService({
            organization_id:req['organization_id'],
            create_user_id:req['account_id'],
            type:type,
            resource_id:req['patient_appointment'].getDataValue('id'),
            patient_id:req['patient'].getDataValue('id'),
            data:JSON.stringify({})
        }).add();
    }

    


    if (req.body.appointment_note){
        req['patient_appointment'].getDataValue('appointment_note').updateAttributes({
            complaints:req.body.appointment_note.complaints,
            investigations:req.body.appointment_note.investigations,
            observations:req.body.appointment_note.observations,
            diagnoses:req.body.appointment_note.diagnoses,
            treatments:req.body.appointment_note.treatments,
            recommendations:req.body.appointment_note.recommendations,

        })
    }
    

    res.json({message:'Ok'});

})

export const patientApptDetail = router;
import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';


import {Patient} from './../models/user/patient/main';
import {User} from './../models/user/main';

import {PatientRichNote, PatientNote} from './../models/user/patient/note';

import {Appointment} from './../models/appointment/main';

import {apptFreeCells} from './apptFreeCells';
import {apptPrint} from './apptPrint';

const router = Router();

router.use('/freeCells', apptFreeCells);
router.use('/print', apptPrint);

router.post('/blank', (req:Request, res:Response) => {


    req.body.patient_id=null;
    req.body.organization_id = req['organization_id'];
    req.body.create_user_id = req['account_id'];

    req.body.notify_create = false;
    req.body.notify_before = false;

    Appointment.create<Appointment>(req.body).then(
        appointment => {
            res.json(appointment);
        }
    )
})

router.put('/blank', (req:Request, res:Response) => {


    req.body.patient_id=null;
    req.body.organization_id = req['organization_id'];
    req.body.create_user_id = req['account_id'];

    Appointment.findOne<Appointment>({
        where:{
            organization_id:req['organization_id'],
            id:req.body.id
        }
    }).then(
        appointment => {

            if (!appointment){
                res.status(404).json({message:'NOT_FOUND_APPT'});
                return;
            }

            appointment.updateAttributes({
                date        : req.body.date,
                start_time  : req.body.start_time,
                end_time    : req.body.end_time,
                is_confirmed: req.body.is_confirmed,
                is_noshow   : req.body.is_noshow,
                is_deleted  : req.body.is_deleted,
                is_completed: req.body.is_completed,
                section_id  : req.body.section_id,
                room_id     : req.body.room_id,
                provider_id : req.body.provider_id,
                note:req.body.note
            })

            res.json({message:'Ok'});
        }
    )
})

router.get('/:startDate/:endDate', (req:Request, res:Response) => {

    var interval = {
        start:req.params.startDate,
        end: req.params.endDate
    };

    if (
        (!moment(req.params.startDate, 'YYYY-MM-DD', true).isValid() || !moment(req.params.endDate, 'YYYY-MM-DD', true).isValid()) ||
        moment(req.params.startDate) > moment(req.params.endDate)
    ){
        res.status(400);
        return res.json({message: 'Bad Request.'});
    }

    Appointment.findAll<Appointment>({
         where: {
            date: {
                $lte: interval.end,
                $gte: interval.start
            },
            organization_id:req['organization_id'],
            is_deleted:false
        },
        include:[{
            model:Patient,
            include:[{
                model:User
            }, {
                model:PatientRichNote,
                where:{
                    is_urgent:true
                },
                required:false
            }, {
                model:PatientNote,
                where:{
                    is_urgent:true
                },
                required:false
            }]
        }, User]
    }).then(
        response => {
            res.json(response);
        }
    )


    let appt = req.body;

})

export const apptRouter = router;
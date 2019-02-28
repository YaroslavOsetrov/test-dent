import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';
import {db} from './../models';

import {UserRole} from './../models/user/user_role';
import {User} from './../models/user/main';

import {PatientNote} from './../models/user/patient/note';

import {LogService} from './../services/logService';

const models = db.models;
const router = Router({mergeParams:true});

router.get('/', (req:Request, res:Response) => {

    PatientNote.findAll({
        where:{
            patient_id:req['patient']['id']
        },
        order:[['createdAt', 'DESC']]
    }).then(
        response => {
            res.json(response);
        }
    )
});

router.post('/', (req:Request, res:Response) => {


    req.body['patient_id'] = req['patient']['id'];
    req.body['create_user_id'] = req['account_id'];

    console.log(req.body);
    PatientNote.create(req.body).then(
        response => {
            res.json(response);
        },
        errors => {
            res.status(400).json({message:'BAD_REQUEST'});
        }
    );
});



router.put('/:noteId', (req, res) => {

     PatientNote.findOne({
        where:{
            patient_id:req['patient']['id'],
            id:req.params.noteId
        }
    }).then(
        response => {
            response.updateAttributes({
                note:req.body.note,
                is_urgent:req.body.is_urgent
            })
        }
    )

})

router.delete('/:noteId', (req, res) => {

     PatientNote.findOne({
        where:{
            patient_id:req['patient']['id'],
            create_user_id:req['account_id'],
            id:req.params.noteId
        }
    }).then(
        response => {

            if (!response){
                return res.status(400).json({message:'NOT_FOUND'});
            }

            response.destroy();

            res.json({message:'Ok'});
        }
    )

})

export const patientNote = router;
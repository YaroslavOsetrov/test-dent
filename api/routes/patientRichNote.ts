import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';
import {db} from './../models';

import {UserRole} from './../models/user/user_role';
import {User} from './../models/user/main';

import {PatientRichNote} from './../models/user/patient/note';

import {LogService} from './../services/logService';

const models = db.models;
const router = Router({mergeParams:true});

router.get('/', (req:Request, res:Response) => {

    PatientRichNote.findAll({
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

    PatientRichNote.destroy({
        where:{
            patient_id:req['patient']['id']
        }
    }).then(
        response => {
            req.body.forEach(element => {
                element['patient_id'] = req['patient']['id'];
                element['create_user_id'] = req['account_id'];
            });
            
            PatientRichNote.bulkCreate<PatientRichNote>(req.body).then(
                response => {
                    res.json(response);
                }
            );
        }
    )
});



router.put('/:noteId', (req, res) => {

     

})

router.delete('/:noteId', (req, res) => {

     PatientRichNote.findOne({
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
             new LogService({
                organization_id:req['organization_id'],
                create_user_id:req['account_id'],
                type:'note_add',
                resource_id:response.getDataValue('id'),
                patient_id:req['patient'].getDataValue('id')
            }).destroy();

            response.destroy();

            res.json({message:'Ok'});
        }
    )

})

export const patientRichNote = router;
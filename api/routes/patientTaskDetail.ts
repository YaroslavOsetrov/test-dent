import {Router, Request, Response, RequestHandler} from 'express';
import {db} from './../models/index';

import {Patient} from './../models/user/patient/main';

import {OrganizationTask} from './../models/organization/task';

import {PatientTask} from './../models/user/patient/task';

import {User} from './../models/user/main';

import {UserRole} from './../models/user/user_role';

import {LogService} from './../services/logService';


const router = Router({mergeParams:true});

router.all('*', (req, res, next) => {

    PatientTask.findOne({
        where:{
            id:req.params.taskId,
            patient_id:req['patient']['id']
        }
    }).then(
        response => {
            req['patient_task'] = response;
            next();
        },
        errors => {
            res.status(404).json({message:'APPT_NOT_FOUND'});
        }
    )
   
});

router.get('/', (req:Request, res:Response) => {
    res.json(req['patient_task']);
})

router.delete('/', (req:Request, res:Response) => {

     new LogService({
        type:'task_add',
        resource_id:req['patient_task'].getDataValue('id'),
        patient_id:req['patient'].getDataValue('id')
    }).destroy();

    
     new LogService({
        type:'task_complete',
        resource_id:req['patient_task'].getDataValue('id'),
        patient_id:req['patient'].getDataValue('id')
    }).destroy();

    req['patient_task'].destroy();



    res.json({message:'Ok'});

});

router.put('/', (req:Request, res:Response) => {

    req['patient_task'].updateAttributes({
       is_completed:req.body.is_completed,
       note:req.body.note,
       note_completed:req.body.note_completed,
       date:req.body.date,
       title:req.body.title,
       tag_key:req.body.tag_key,
    });

    if (req.body.is_completed){
         new LogService({
            organization_id:req['organization_id'],
            create_user_id:req['account_id'],
            type:'task_complete',
            resource_id:req['patient_task'].getDataValue('id'),
            patient_id:req['patient'].getDataValue('id'),
            data:JSON.stringify({})
        }).add();
    }

    res.json({message:'Ok'});

})

export const patientTaskDetail = router;
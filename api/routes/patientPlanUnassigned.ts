import {Router, Request, Response, RequestHandler} from 'express';
import {db} from './../models/index';

import {Patient} from './../models/user/patient/main';

import {OrganizationTask} from './../models/organization/task';

import {PatientPlan} from './../models/user/patient/plan';

import {PatientProcedure} from './../models/user/patient/procedure';

import {User} from './../models/user/main';

import {UserRole} from './../models/user/user_role';

import {Appointment} from './../models/appointment/main';

const router = Router({mergeParams:true});

router.get('/', (req:Request, res:Response) => {

    PatientPlan.findAll({
        where:{
            patient_id:req['patient']['id'],
            status:1
        },
        include:[{
            model:PatientProcedure,
            where:{
                appointment_id:null
            }
        }]
    }).then(
        response => {
         
            res.json(response);
        }
    )
});


export const patientPlanUnassigned = router;
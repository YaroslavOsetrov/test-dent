import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';
import * as formidable from 'formidable';

import * as randomstring from 'randomstring';

import {db} from './../models';

import {OrganizationLimit} from './../models/organization/limit';

import {PatientFile} from './../models/user/patient/file';

const models = db.models;
const router = Router({mergeParams:true});

router.all('/*', (req:Request, res:Response, next:any) => {

    PatientFile.findOne({
        where:{
            patient_id:req['patient']['id'],
            id:req.params.fileId
        }
    }).then(
        response =>{
            if (response){
                req['file'] = response;
                next();
            }else{
                return res.status(404).json({message:'FILE_NOT_FOUND'});
            }
        },
        errors => {
            return res.status(404).json({message:'FILE_NOT_FOUND'});
        }
    )
})

router.get('/*', (req:Request, res:Response) => {
    res.json(req['file']);
})

router.put('/*', (req:Request, res:Response) => {

    req['file'].updateAttributes({
        name:req.body.name
    });

    res.json({message:'Ok'});
})

export const patientFileDetail = router;
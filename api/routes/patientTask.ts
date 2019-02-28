import {Router, Request, Response, RequestHandler} from 'express';
import {db} from './../models/index';

import {Patient} from './../models/user/patient/main';

import {OrganizationTask} from './../models/organization/task';

import {PatientTask} from './../models/user/patient/task';

import {User} from './../models/user/main';

import {UserRole} from './../models/user/user_role';

import {LogService} from './../services/logService';

import * as moment from 'moment';

const router = Router({mergeParams:true});

const updateTagsFunc = (req:Request, model:OrganizationTask) => {
    let tagsArray:Array<string> = JSON.parse(model.tags);

    let foundedTag = false;
    tagsArray.forEach(item => {
        if (item.toLowerCase() == req.body['tag_key'].toLowerCase())
            foundedTag = true;
    });

    console.log(tagsArray);
    console.log(req.body['tag_key']);

    if (!foundedTag){

        tagsArray.push(req.body['tag_key']);

        model.updateAttributes({
            tags : JSON.stringify(tagsArray)
        });
    }
}

router.get('/', (req:Request, res:Response) => {

    PatientTask.findAll({
        where:{
            patient_id:req['patient']['id'],
        },
        include:[{
            model:Patient,
            include:[User]
        }, User],
        order: db.Sequelize.literal('date DESC ')
    }).then(
        response => {
            res.json(response);
        }
    )

});



router.post('/', (req:Request, res:Response) => {

    req.body['create_user_id'] = req['account_id'];
    req.body['organization_id'] = req['organization_id'];
    req.body['patient_id'] = req['patient']['id'];

    if (req.body['date'] == 'Invalid date' || !req.body['date']){
        req.body['date'] = moment().add(1, 'days').format('YYYY-MM-DD');
    }

    if (!req.body.hasOwnProperty('provider_id'))
        req.body['provider_id'] = req['account_id'];


     UserRole.findOne({
        where:{
            organization_id:req['organization_id'],
            user_id:req.body.provider_id
        }
    }).then(
        response => {
            if (!response){
                res.status(400).json({message:'UNDEFINED_PROVIDER'});
            }


            if (req.body['tag_key']){
                OrganizationTask.findById<OrganizationTask>(req['organization_id']).then(
                    response => {

                        if (response == null){

                            OrganizationTask.create<OrganizationTask>({
                                organization_id:req['organization_id'],
                                tags:'[]'
                            }).then(
                                response => {
                                    updateTagsFunc(req, response);
                                }
                            )

                        }else{
                            updateTagsFunc(req, response);
                        }
                        
                    }
                )
            }

            PatientTask.create<PatientTask>(req.body).then(
                response => {
                     new LogService({
                        organization_id:req['organization_id'],
                        create_user_id:req['account_id'],
                        type:'task_add',
                        resource_id:response.getDataValue('id'),
                        patient_id:req['patient'].getDataValue('id'),
                        event_date:response.getDataValue('date'),
                        data:JSON.stringify({})
                    }).add();
                    res.json(response);
                },
                errors => {
                    console.log(errors);
                    return res.status(400).json({message:'INVALID_DATA'});
                }
            )

        }
    ).catch(
        err => {
            console.log(err);
            return res.status(400).json({message:'INVALID_DATA'});
        }
    )

});


export const patientTask = router;
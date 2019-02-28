import {Router, Request, Response, RequestHandler} from 'express';
import * as fs from 'fs';
import * as _jsonValidator from 'jsonschema';

import {db} from './../models';
import {User} from './../models/user/main';

import {OrganizationScheduler} from './../models/organization/scheduler';

import {OrganizationOffice, OrganizationOfficeRoom} from './../models/organization/office';

const JsonValidator = _jsonValidator.Validator;

const router = Router();


router.all('/', (req, res, next) => {

    OrganizationScheduler.findById(req['organization_id']).then(
        organizationScheduler => {
            organizationScheduler.setDataValue('sections', JSON.parse(organizationScheduler.getDataValue('sections')));
            req['organization_scheduler'] = organizationScheduler;
            next();
        }
    );

});

router.get('/', (req:Request, res:Response) => {

    res.json(req['organization_scheduler']);

});

router.put('/', (req:Request, res:Response) => {

    let validator = new JsonValidator();

    fs.readFile(require('app-root-dir').get() + '/public/i18n/cabinets_default/scheme.json', 'utf8', (err, data) => {

        let dataSchema = JSON.parse(data);

        if (!validator.validate(req.body['sections'], dataSchema).valid){
            return res.status(400).json({message: 'INVALID_SECTIONS_SCHEME'});
        }

        if (req.body['slot_duration'] != 15 && req.body['slot_duration'] != 20 && req.body['slot_duration'] != 30){
            req.body['slot_duration'] = 15;
        }

        OrganizationOfficeRoom.findAll({
            where:{
                office_id:req.body.rooms[0]['office_id']
            }
        }).then(
            response => {
                response.forEach((rowExist) => {
                    req.body.rooms.forEach((rowNew) => {
                        if (rowNew['id'] == rowExist['id'])
                        rowExist.updateAttributes({
                            name:rowNew['name']
                        })
                    }) 
                })
            }
        )



        req['organization_scheduler'].updateAttributes({
            sections        : JSON.stringify(req.body['sections']),
            first_day_index : req.body['first_day_index'],
            hidden_days     : req.body['hidden_days'],
            start_hour      : req.body['start_hour'],
            end_hour        : req.body['end_hour'],
            slot_duration   : req.body['slot_duration']
        });

        res.json({message:'OK'});

    });
});




export const schedulerRouter = router;

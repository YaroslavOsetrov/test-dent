import {Router, Request, Response, RequestHandler} from 'express';
import * as moment from 'moment';

import * as urlencode from 'urlencode';

import {db} from './../models/index';

import {User} from './../models/user/main';
import {Patient} from './../models/user/patient/main';

import {PatientTask} from './../models/user/patient/task';

import {i18nService} from './../services/i18nService';

import {OrganizationCustomField} from './../models/organization/custom_field';

import { transliterate as tr, slugify } from 'transliteration';

const router = Router();

router.get('/', (req, res, next) => {

    OrganizationCustomField.findAll<OrganizationCustomField>({
        where:{
            organization_id:req['organization_id']
        }
    }).then(
        response => {
            res.json(response);
        }
    )
})

router.post('/', (req:Request, res:Response) => {

    let fields = [];

    req.body.forEach((row) => {
        row['organization_id'] = req['organization_id'];
        row['field_name_internal'] = slugify(row['field_name']);
        fields.push(row);
    })

    OrganizationCustomField.destroy({
        where:{
            organization_id:req['organization_id']
        }
    }).then(
        response => {
            OrganizationCustomField.bulkCreate<OrganizationCustomField>(req.body).then(
                response => {
                    res.json(response)
                }, errors => {
                    res.status(400).json({message:'BAD_REQUEST'});
                }
            );
        }
    )
    
})

router.delete('/:fieldId', (req, res) => {

    OrganizationCustomField.findOne<OrganizationCustomField>({
        where:{
            organization_id:req['organization_id'],
            id:req.params.fieldId
        }
    }).then(
        response => {
            response.destroy();
            res.json({message:'Ok'});
        }, errors => {
            res.status(400).json({message:'BAD_REQUEST'});
        }
    );


})

export const organizationCustomField = router;
import {Router, Request, Response, RequestHandler} from 'express';
import * as moment from 'moment';

import * as urlencode from 'urlencode';

import * as fs from 'fs';
import * as _jsonValidator from 'jsonschema';

import {db} from './../models/index';

import {User} from './../models/user/main';
import {Patient} from './../models/user/patient/main';

import {PatientTask} from './../models/user/patient/task';

import {i18nService} from './../services/i18nService';

import {OrganizationRichNoteTemplate} from './../models/organization/rich_note_template';

const router = Router();

const JsonValidator = _jsonValidator.Validator;

router.all('*', (req, res, next) => {

    let i18n = new i18nService();

    OrganizationRichNoteTemplate.findById<OrganizationRichNoteTemplate>(req['organization_id']).then(
        response => {
            
            let richNoteTemplate = [];
            if (response){
                richNoteTemplate = JSON.parse(response.getDataValue('notes'));
            }else{
                richNoteTemplate = i18n.getFile('rich_notes', req['organization'].getDataValue('language'));
                OrganizationRichNoteTemplate.create({
                    organization_id:req['organization_id'],
                    notes:JSON.stringify(richNoteTemplate)
                }).then(
                    response => {
                        
                    }
                );
            }
            req['rich_note_template'] = richNoteTemplate;
            next();
        }
    );
});

router.get('/', (req:Request, res:Response) => {
    res.json(req['rich_note_template']);
});

router.put('/', (req:Request, res:Response) => {


    let notifByteMaxSize = 10000000;

    let validator = new JsonValidator();

    fs.readFile(require('app-root-dir').get() + '/public/i18n/rich_notes/scheme.json', 'utf8', (err, data) => {

        let schema = JSON.parse(data);
        

        if (!validator.validate(req.body, schema).valid){
            return res.status(400).json({message: 'INVALID_PRICE_SCHEME'});
        }

        if (Buffer.byteLength(JSON.stringify(req.body), 'utf8') > notifByteMaxSize){
            return res.status(400).json({message: 'EXCEEDED_PRICE_SIZE'});
        }
        

        OrganizationRichNoteTemplate.findById<OrganizationRichNoteTemplate>(req['organization_id']).then(
            response => {
                
                
                if (response)
                    response.updateAttributes({
                        notes:JSON.stringify(req.body)
                    });
                else
                    OrganizationRichNoteTemplate.create({
                        organization_id:req['organization_id'],
                        notes:JSON.stringify(req.body)
                    }).then(
                        response => {

                        }
                    )

                 res.json({message:'Ok'});
            }
        );
    });

   
});

export const organizationRichNoteTemplates = router;
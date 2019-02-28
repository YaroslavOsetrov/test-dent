import {Router, Request, Response, RequestHandler} from 'express';
import * as moment from 'moment';

import * as urlencode from 'urlencode';

import {db} from './../models/index';

import {OrganizationDocument} from './../models/organization/document';

const router = Router();


router.get('/', (req, res) => {

    OrganizationDocument.findAll<OrganizationDocument>({
        where:{
            organization_id:req['organization_id']
        }
    }).then(
        response => {
            res.json(response);
        }
    )

});

router.all('/:documentId*', (req, res, next) => {

    OrganizationDocument.findOne({
        where:{
            organization_id:req['organization_id'],
            id:req.params.documentId
        }
    }).then(
        response => {

            if (!response){
                return res.status(404).json({message:'DOCUMENT_NOT_FOUND'});
            }
            req['document'] = response;
            next();
        }
    )

})

router.put('/:documentId', (req, res) => {

    req['document'].updateAttributes({
        title:req.body.title,
        text:req.body.text
    });

    res.json({message:'Ok'});

})

router.delete('/:documentId', (req, res) => {

    req['document'].destroy();

    res.json({message:'Ok'});

})

router.post('/', (req, res) => {

    OrganizationDocument.create<OrganizationDocument>({
        title:req.body.title,
        organization_id:req['organization_id'],
        text:req.body.text
    }).then(
        response => {
            res.json(response);
        }
    ).catch(
        errors => {
            res.status(400).json({message:'INVALID_DOCUMENT'});
        }
    )

})


export const organizationDocs = router;
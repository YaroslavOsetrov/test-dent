import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';
import {db} from './../models';

import {OrganizationCall} from './../models/organization/call';

const models = db.models;
const router = Router({mergeParams:true});

const pageLimit = 10;

router.get('/incoming', (req, res) => {

    OrganizationCall.findAll<OrganizationCall>({
        where : {
            organization_id : req['organization_id'],
            is_showed: false
        }
    }).then(
        response => {

            let ids = [];
            response.forEach((row) => {

                ids.push(row.getDataValue('id'));

            })

            if (response.length > 0)
            OrganizationCall.update({is_showed:true}, {
                where:{
                    is_showed:false,
                    id:ids
                }
            })

            res.json(response);
        }
    )


})

export const organizationCallRouter = router;
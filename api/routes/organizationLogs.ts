import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';
import {db} from './../models';

import {OrganizationLog, OrganizationLogView} from './../models/organization/log';

const models = db.models;
const router = Router({mergeParams:true});

const pageLimit = 10;
/*
router.get('/all/:page', (req, res) => {

    let startPos = Number(req.params.page) * pageLimit;

    let orderBy = 'createdAt DESC';

    OrganizationLog.findAll({
        where : {
            organization_id : req['organization_id'],
            $or:[
                {user_id:req['account_id']},
                {user_id:null}
            ]
        },
        include:[{
            model:OrganizationLogView
        }],
        order: db.Sequelize.literal(orderBy + ' OFFSET ' + startPos + '  ROWS FETCH NEXT ' + pageLimit + ' ROWS ONLY')
    }).then(
        response => {
            res.json(response);
        }
    )


})

router.get('/new/:afterId', (req, res) => {

    let lastId = req.params.afterId;

    OrganizationLog.findOne({
        where:{
            id:lastId,
            organization_id:req['organization_id'],
            $or:[
                {user_id:req['account_id']},
                {user_id:null}
            ]
        }
    }).then(
        lastLog => {
            
            if (!lastLog){
                return res.status(404).json({message:'NOT_FOUND'});
            }

            OrganizationLog.findAll({
                where:{
                    organization_id:req['organization_id'],
                    $or:[
                        {user_id:req['account_id']},
                        {user_id:null}
                    ],
                    id:{
                        $not:lastLog.getDataValue('id')
                    },
                    createdAt:{
                        $gte:lastLog.getDataValue('createdAt')
                    }
                },
                include:[{
                    model:OrganizationLogView
                }],
                order:db.Sequelize.literal('createdAt DESC')
            }).then(
                response => {
                    res.json(response);
                }
            )

        }
    )

})

router.post('/addview', (req, res) => {

    if (!(req.body instanceof Array)){
        return res.status(400).json({message:'BAD_REQUEST'});
    }

    let logViews = [];

    req.body.forEach((logId) => {
        logViews.push({log_id:logId, user_id:req['account_id']});
    })

    OrganizationLogView.bulkCreate<OrganizationLogView>(logViews).then(
        response => {
            res.json({message:'Ok'});
        }
    )

})

*/
export const organizationLogsRouter = router;
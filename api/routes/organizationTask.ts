import {Router, Request, Response, RequestHandler} from 'express';
import * as moment from 'moment';

import * as urlencode from 'urlencode';

import {db} from './../models/index';

import {User} from './../models/user/main';
import {Patient} from './../models/user/patient/main';

import {PatientTask} from './../models/user/patient/task';

import {OrganizationTask} from './../models/organization/task';

const router = Router();

const parseTags = (tags:any) => {

    tags = tags.split(';');

    let literal_tags = '';

    if (tags.length > 0){
        tags.forEach((tag:any) => {
            literal_tags = literal_tags + 'N\''+tag+'\',';
        });

        literal_tags = literal_tags.substring(0, literal_tags.length - 1);

        literal_tags = '[PatientTask].[tag_key] IN (' + literal_tags + ')'
    }

    return literal_tags;

}

router.get('/:userId/due', (req, res) => {

    let expiredDate = moment().format('YYYY-MM-DD');

    let whereClause = {
        organization_id:req['organization_id'],
        date: {
            $lte: expiredDate
        },
        is_completed:false
    };


    if (req.params.userId == '0'){

        if (!req['user_role']['add_task']){
            whereClause['provider_id'] = req['account_id']
        }
    }else{

        if (req['user_role']['add_task']){
            whereClause['provider_id'] = req.params.userId;
        }else{
            whereClause['provider_id'] = req['account_id'];
        }
    }

    PatientTask.findAll<PatientTask>({
        include:[{
            model:Patient,
            include:[User]
        }, User],
        where:whereClause,
        order: db.Sequelize.literal('date ASC ')
    }).then(
        response => {
            res.json(response);
        }
    )

})

router.get('/:userId/:startDate/:endDate', (req, res, next) => {

    if (!req.params.page)
        req.params.page = 0;

    let pageLimit = 50;

    let startPos = Number(req.params.page) * pageLimit;

    var interval = {
        start:req.params.startDate,
        end: req.params.endDate
    };

    if (
        (!moment(req.params.startDate, 'YYYY-MM-DD', true).isValid() || !moment(req.params.endDate, 'YYYY-MM-DD', true).isValid()) ||
        moment(req.params.startDate) > moment(req.params.endDate)
    ){
        res.status(400);
        return res.json({message: 'INCORRECT_DATE'});
    }

    let whereClause = {
        organization_id:req['organization_id'],
        date: {
            $gte: interval.start,
            $lte: interval.end
        },
        is_completed:false,
     //   tag_key:db.Sequelize.literal(literal_tags)
    };


    if (req.params.userId == '0'){

        if (!req['user_role']['add_task']){
            whereClause['provider_id'] = req['account_id']
        }
    }else{

        if (req['user_role']['add_task']){
            whereClause['provider_id'] = req.params.userId;
        }else{
            whereClause['provider_id'] = req['account_id'];
        }
    }


    PatientTask.findAll<PatientTask>({
        include:[{
            model:Patient,
            include:[User]
        }, User],
        where:whereClause,
        order: db.Sequelize.literal('date ASC ')
    }).then(
        response => {
            res.json(response);
        }
    )

});

router.put('/complete', (req:Request, res:Response) => {
    
    PatientTask.update({
        is_completed:true
    }, {
        where:{
            id:req.body,
            organization_id:req['organization_id']
        }
    }).then(
        response => {
            res.json({message:'Ok'})
        }
    ).catch(
        response => {
            res.json({message:'UNABLE_TO_UPDATE'});
        }
    )
});

router.delete('/', (req:Request, res:Response) => {
    PatientTask.destroy({
        where:{
            id:req.body,
            organization_id:req['organization_id']
        }
    }).then(
        response => {
            res.json({message:'Ok'})
        }
    ).catch(
        response => {
            res.json({message:'UNABLE_TO_DESTROY'});
        }
    )
})


router.get('/tags', (req:Request, res:Response) => {

    OrganizationTask.findById<OrganizationTask>(req['organization_id']).then(
        response => {

            if (!response){

                OrganizationTask.create({
                    organization_id:req['organization_id'],
                    tags:'[]'
                }).then(
                    response => {
                        res.json(JSON.parse(response.getDataValue('tags')));
                    }
                )
            }else{
                res.json(JSON.parse(response.getDataValue('tags')));
            }
        }
    )

});




export const organizationTaskRouter = router;

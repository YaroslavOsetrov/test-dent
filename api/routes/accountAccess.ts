import {Router, Request, Response, RequestHandler} from 'express';
import * as moment from 'moment';

import {User} from './../models/user/main';

import {UserRole} from './../models/user/user_role';

const router = Router();
/*
router.get('/', (req, res, next) => {

    User.findAll<User>({
        where:{
            organization_id:(req['organization_id'] as number)
        },
        include:[UserRole]
    }).then(
        response => {
            res.json(response);
        }
    )
});
*/
router.all('/:account_id*', (req, res, next) => {
    
    User.findAll({
        where:{
            id:req.params.account_id
        },
        include:[UserRole]
    }).then(
        response => {

            if (!response){
                return res.status(404).json({message:'ACCOUNT_NOT_FOUND'});
            }
            req['account_access'] = response;
        }
    )
});

router.put('/:account_id', (req:Request, res:Response) => {

    req['account_access'].updateAttributes({
        view_analytics:req.body.view_analytics,
        edit_price:req.body.edit_price,
        edit_appt:req.body.edit_appt,
        view_patient:req.body.view_patient,
        edit_payment:req.body.edit_payment
    });

    res.json({message:'Ok'});


})


export const accountAccess = router;
import {Router, Request, Response, RequestHandler} from 'express';
import * as fs from 'fs';
import * as _jsonValidator from 'jsonschema';

import {db} from './../models';

import {UserRole} from './../models/user/user_role';

import {User} from './../models/user/main';

const JsonValidator = _jsonValidator.Validator;

const models = db.models;
const router = Router();

const priceByteMaxSize = 10000000;

router.get('/', (req, res, next) => {

    User.findAll<User>({
        include:[{
            model:UserRole,
            where:{
                organization_id:req['organization_id']
            }
        }],
        order: db.Sequelize.literal(' fullname DESC')
    }).then(
        response => {

            let formattedResponse:Array<User> = [];
            response.forEach((item, i) => {
                if (item.getDataValue('user_roles').length > 0)
                    if (item.getDataValue('id') != req['account_id']){
                        formattedResponse.push(item);
                    }else{
                        let itemNew = Object.assign({}, item.get());
                        if (req['organization'].getDataValue('create_user_id') == req['account_id']){
                            itemNew['is_founder'] = true;
                        }
                        formattedResponse.unshift(itemNew);
                    } 
            });

            res.json(formattedResponse);
        }
    )

});


export const userRouter = router;
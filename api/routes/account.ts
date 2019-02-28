import {Router, Request, Response, RequestHandler} from 'express';
import * as moment from 'moment';

import {User} from './../models/user/main';

const router = Router();

router.all('*', (req, res, next) => {

    User.findById<User>(req['account_id']).then(
        response => {
            req['account'] = response;
            next();
        }
    )


});

router.get('/', (req, res, next) => {

    res.json(req['account']);

});

router.put('/', (req:Request, res:Response) => {

    if (req.body.password && req.body.password_new){

          if (!req['account'].check_password(req.body.password)){
                res.status(400);
                return res.json({message: 'INCORRECT_OLD_PASS'});
            }

            if (!req['account'].set_password(req.body.password_new)){
                res.status(400);
                return res.json({message: 'INCORRECT_NEW_PASS'});
            }

            req['account'].updateAttributes({
                password_hash: req['account'].password_hash
            });
    }else{
        req['account'].updateAttributes({
            fullname:req.body.fullname,
            timezone_offset:req.body.timezone_offset,
            address:req.body.address,
            language:req.body.language,
            phone:req.body.phone
        });

        if (req.body.is_uni_teeth_scheme)
            req['account'].updateAttributes({
                is_uni_teeth_scheme:req.body.is_uni_teeth_scheme
            });

    }

    res.json({message:'Ok'});
});

export const accountRouter = router;
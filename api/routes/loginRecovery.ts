import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';

import {db} from './../models';
import {User} from './../models/user/main';

import {EmailService} from './../services/emailService';

import {UserRecovery} from './../models/user/recovery';

const models = db.models;
const router = Router();

router.post('/confirm', (req, res, next) => {

    if (!req.body.password){
        return res.status(400).json({message: 'ENTER_ACCOUNT_CREDENTIALS'});
    }

    UserRecovery.findByPrimary<UserRecovery>(req.body.id).then(
        user_recovery => {
            if (user_recovery){

                let account_id = user_recovery.getDataValue('user_id');

                User.findById<User>(account_id).then(
                    user_account => {

                        try{
                            user_account.set_password(req.body.password);

                            user_account.save();

                            user_recovery.destroy();

                            res.json({message:'OK'});
                        }catch (e){
                            res.status(400).json({message:'INCORRECT_PASSWORD'});
                        }
                        

                       

                    }
                );

            }else{
                return res.status(400).json({message: 'BAD_TOKEN' });
            }
        }
    );

})

router.post('/validate', (req, res, next) => {

    UserRecovery.findByPrimary(req.body.id).then(
        response => {
            if (response){
                res.json({message:'Ok'});
            }else{
                res.status(400).json({message:'RECOVERY_NOT_FOUND'});
            }
        }
    )


});

router.post('/request', (req, res, next) => {

    if (!req.body.email){
        return res.status(400).json({message: 'ENTER_ACCOUNT_CREDENTIALS'});
    }

     User.findOne<User>({
        where:{
            email : req.body.email
        }
    }).then(
        user_account => {

            if (!user_account){
                return res.status(404).json({message: 'ACCOUNT_NOT_FOUND'});
            }

            if (!user_account.is_email_confirmed){
                return res.status(400).json({message: 'EMAIL_NOT_CONFIRMED'});
            }
            

            UserRecovery.findOne<UserRecovery>({
                where:{
                    user_id:user_account.getDataValue('id'),
                    createdAt:{
                        $gt: moment().add(-10, 'minutes').format()
                    }
                }
            }).then(
                response => {
                    if (response){
                        return res.status(400).json({message: 'ALREADY_RECOVERY_REQUESTED'});
                    }else{

                        let email = new EmailService();
                        
                        email.configure({
                            language    : user_account.getDataValue('language'),
                            template    : 'accountReset',
                            to          : user_account.getDataValue('email')
                        });

                        UserRecovery.create<UserRecovery>({
                            user_id:user_account.getDataValue('id')
                        }).then(response => {
                            let token = response.getDataValue('id');


                            email.replaceHtml({
                                fullname   : user_account.fullname,
                                token      : token
                            });

                            email.send();

                            res.json({token:token});
                        });
                    }
                }
            )

            
        }
    );

})

export const loginRecovery = router;
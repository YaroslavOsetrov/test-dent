//libs
import {Router, Request, Response, RequestHandler} from 'express';
import * as moment from 'moment';

//services
import {ConfigService} from './../services/configService';

//models
import {Organization} from './../models/organization/main';
import {OrganizationSubscription} from './../models/organization/subscription';
import {User} from './../models/user/main';
import {UserRole} from './../models/user/user_role';
import {UserInvitation} from './../models/user/invitation';

//external
import {_createOrganization} from './registration';

const router = Router();

router.get('/:inviteId', (req:Request, res:Response) => {

    UserInvitation.findOne({
        where:{
            id:req.params.inviteId
        }
    }).then(
        response => {

            if (!response){
                return res.status(404).json({message:'INVITATION_NOT_FOUND'});
            }
            res.json(response);
        }
    );
});

router.post('/:inviteId', (req:Request, res:Response) => {

    UserInvitation.findOne({
            where:{
                id:req.params.inviteId
            }
        }).then(
            invitation => {
            
            if (!invitation){
                return res.status(404).json({message:'INVITATION_NOT_FOUND'});
            }

            if (invitation.getDataValue('is_confirmed')){
                return res.status(400).json({message:'ALREADY_CONFIRMED'});
            }

            invitation.updateAttributes({
                is_confirmed:true
            });

            User.findOne<User>({
                where:{
                    email:req.body.email
                }
            }).then(
                user => {
                    let password_setted = user.set_password(req.body.password);
                    _createOrganization(req, res, user);

                    user.updateAttributes({
                        fullname:req.body.fullname,
                        phone:req.body.phone,
                        password_hash:user.getDataValue('password_hash'),
                        is_email_confirmed:true
                    });

                    res.json({message:'Ok'});
                }
            );
        }
    )
});

export const loginInviteRouter =  router;
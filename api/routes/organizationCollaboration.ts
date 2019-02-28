import {Router, Request, Response, RequestHandler} from 'express';
import * as moment from 'moment';

import * as fs from 'fs';

import {db} from './../models/index';

import {AppCountry} from './../models/app_country';

import {User} from './../models/user/main';
import {UserRole} from './../models/user/user_role';

import {UserInvitation} from './../models/user/invitation';

import {EmailService} from './../services/emailService';

import {ConfigService} from './../services/configService';

import {Organization} from './../models/organization/main';

const router = Router();

const env = process.env.APP_ENV || 'development';

const config = new ConfigService();

const stripe = require('stripe')(config.getConfig('stripe')[env]['secret_key']);

const subscriptionUpdate = (req:Request, res:Response, invitation?) => {
     UserInvitation.count({
        where:{
            organization_id:req['organization_id']
        }
    }).then(usersCount => {

        let organization = req['organization'];

        let newUsers = usersCount;

        let email = new EmailService();

        if (invitation){
            
            User.findById<User>(req['account_id']).then(
                user_account => {

                    email.configure({
                        language    : organization.getDataValue('language'),
                        template    : 'accountInvitation',
                        to          : req.body.email
                    });

                    email.replaceHtml({
                        token       : invitation.getDataValue('id'),
                        fullname    : user_account.getDataValue('fullname')
                    });

                    email.send();

                }
            )

        }
        
        let stripe_id = organization.getDataValue('stripe_id');

        let subscription = organization.getDataValue('organization_subscription');
        
        let defaultPrice = subscription.getDataValue('monthly_fee_base');

       
        let limit = req['organization'].getDataValue('organization_limit');


        AppCountry.findOne<AppCountry>({
            where:{
                currency_code:subscription.getDataValue('currency_code')
            }
        }).then(countryDefault => {

                let newMonthlyFee = countryDefault.getDataValue('monthly_fee') + countryDefault.getDataValue('monthly_fee_base') * newUsers;

                subscription.updateAttributes({
                    monthly_fee:newMonthlyFee
                });

                limit.updateAttributes({
                    users_count:newUsers
                });
                
                if (stripe_id)
                stripe.customers.retrieve(
                    stripe_id,
                    (err:any, customer:any) => {
                    
                        console.log(err);
                    var subId = customer.subscriptions.data[0].id;

                    let planId = req['organization_id'] + '-' + new Date().getTime();
                    stripe.plans.create({
                        amount: Number(newMonthlyFee) * countryDefault.getDataValue('minimum_prefix'),
                        interval: "month",
                        name: planId,
                        currency: subscription.getDataValue('currency_code'),
                        id: planId,
                        trial_period_days: 0
                    }, (err:any, plan:any) => {

                        stripe.subscriptions.update(
                            subId,
                            {plan: planId},
                            (err:any, subs:any) => {

                            }
                        );
                    });
                }
            );
        });
    })
}

const addInvitation = (user_account:User, user_role:UserRole, req:Request, res:Response) => {
    req.body.user_id = user_account.getDataValue('id');
    
    UserInvitation.create(req.body).then(
        invitation => {
            
            res.json({account:user_account, role:user_role, invitation:invitation});

            subscriptionUpdate(req, res, invitation);
        }
    ).catch(
        err => {
            console.log(err);
            res.status(400).json({message:'INVALID_INVITATION'});
        }
    )
}

router.get('/users', (req:Request, res:Response) => {
    User.findAll<User>({
        include:[{
            model:UserRole,
            where:{
                organization_id:req['organization_id']
            }
        }],
        order: db.Sequelize.literal(' [User].[fullname] ASC')
    }).then(
        response => {
            let formattedResponse:Array<User> = [];
            response.forEach((item, i) => {
                if (item.getDataValue('user_roles').length > 0)
                if (item['id'] != req['account_id']){
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
})

router.put('/user/:user_id', (req:Request, res:Response) => {

    UserRole.findOne({
        where:{
            organization_id:req['organization_id'],
            user_id:req.params.user_id
        }
    }).then(
        user_role => {

            user_role.updateAttributes({
                view_analytics:req.body.view_analytics,
                edit_price:req.body.edit_price,
                edit_appt:req.body.edit_appt,
                view_patient:req.body.view_patient,
                edit_payment:req.body.edit_payment,
                is_doctor:req.body.is_doctor,
                add_task:req.body.add_task,
                access_subscription:req.body.access_subscription,
                access_collaboration:req.body.access_collaboration,
                access_templates:req.body.access_templates,
                allow_sharing:req.body.allow_sharing,
                share_patient:req.body.share_patient,
                edit_patient:req.body.edit_patient,
                delete_patient:req.body.delete_patient,
                create_patient:req.body.create_patient,

                patients:req.body.patients,
                appointments:req.body.appointments,
                patient_profile:req.body.patient_profile,
                patient_billing:req.body.patient_billing,
                patient_treatment:req.body.patient_treatment,
                settings:req.body.settings
            });

            res.json({message:'Ok'});
        }
    )

});

router.get('/invitations', (req ,res) => {

    UserInvitation.findAll({
        where:{
            organization_id:req['organization_id']
        },
        order:[['createdAt', 'DESC']],
        include:[{
            model:User,
            required:true
        }]
    }).then(
        response => {
            res.json(response);
        }
    )

})


router.post('/invitations', (req:Request, res:Response) => {

    req.body.organization_id = req['organization_id'];
    
    let user = new User();
    let password_setted = user.set_password('@dentaltap');
    user.email = req.body.email;
    user.phone = '1';
    user.fullname = req.body.fullname;
    user.country_code = req['organization']['country_code'];

    if (!req.body.online_access)
        req.body.online_access = false;

    if (!req.body.is_doctor)
        req.body.is_doctor = false;

    user.save().then((user_account) => {

        user_account.add_to_role(2, req['organization_id'], false, {online_access:req.body.online_access, is_doctor:req.body.is_doctor}).then(
            role => {
                addInvitation(user_account, role, req, res);
            }
        );

    }).catch(e=>{
        User.findOne<User>({
            where:{
                email:req.body.email
            }
        }).then(
            user_account => {
                user_account.add_to_role(2, req['organization_id']).then(
                    role => {
                        addInvitation(user_account, role, req, res);
                    }
                ).catch(
                    err => {
                        res.status(400).json({message:'ALREADY_INVITED'});
                    }
                )
            }
        )
    });
});

router.all('/invitation/:invitation_id*', (req, res, next) => {

    UserInvitation.findByPrimary(req.params.invitation_id).then(
        response => {
            if (!response){
                return res.status(404).json({message:'INVITATION_NOT_FOUND'});
            }
            req['invitation'] = response;
            next();
        }
    );
});

router.delete('/invitation/:invitation_id', (req:Request, res:Response) => {

    User.findOne<User>({
        where:{
            email:req['invitation'].getDataValue('email')
        },
        include:[{
            model:UserRole,
            where:{
                organization_id:req['organization_id']
            }
        }]
    }).then(
        response => {
            let role = response.getDataValue('user_roles')[0];
            UserRole.destroy({
                where:{
                    user_id:role.getDataValue('user_id'),
                    organization_id:req['organization_id']
                }
            });
            req['invitation'].destroy().then(
                response => {
                    subscriptionUpdate(req, res);
                    res.json({message:'Ok'});
                }
            );

        }
    )
})

export const organizationCollaboration = router;
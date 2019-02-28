import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';

import stripePackage from 'stripe';

import {ConfigService} from './../services/configService';

import {AppCountry} from './../models/app_country';

import {UserRole} from './../models/user/user_role';

import {User} from './../models/user/main';


import {Patient} from './../models/user/patient/main';

import {Organization} from './../models/organization/main';

import {OrganizationLimit} from './../models/organization/limit';
import {OrganizationSubscription} from './../models/organization/subscription';

import {OrganizationSubscriptionPayment} from './../models/organization/subscription_payment';

import {EmailService} from './../services/emailService';

const env = process.env.APP_ENV || 'development';

const config = new ConfigService();

const stripe = stripePackage(config.getConfig('stripe')[env]['secret_key']);

const router = Router();

const appDefaults = config.getConfig('default');


router.post('/success', (req, res) => {

     stripe.events.retrieve(req.body.id, (err, event) => {
        if (event){

            if (!event.data.object.metadata.hasOwnProperty('type'))
            Organization.findOne({
                where:{stripe_id:event.data.object.customer},
                include:[OrganizationSubscription]
            }).then(
                organization => {
                    let subscription = organization.getDataValue('organization_subscription');

                    AppCountry.findOne({
                        where:{
                            currency_code:subscription.getDataValue('currency_code')
                        }
                    }).then(appCountry => {
                        stripe.charges.retrieve(
                            req.body.data.object.charge, (err, charge) => {

                                OrganizationSubscriptionPayment.create({
                                    organizatgion_id: subscription.getDataValue('organization_id'),
                                    payment_type: 'subscription',
                                    amount: charge.amount/appCountry.getDataValue('minimum_prefix'),
                                    card_info: charge.source.brand.toUpperCase() + ' ****'+ charge.source.last4
                                });
                            }
                        );
                    });

                    subscription.updateAttributes({
                        is_card_error:false,
                        renew_attempts:0
                    });

                    User.findOne({
                        where:{
                            id:organization.getDataValue('create_user_id')
                        }
                    }).then(
                        user => {

                            let email = new EmailService();

                            email.configure({
                                language    : user.getDataValue('language'),
                                template    : 'subscriptionSuccess',
                                to          : user.getDataValue('email')
                            });

                            email.send();

                            res.json({message:'OK'});

                        }
                    )
                });
        }else{
            res.status(400);
            return res.json({message: 'ERROR_STRIPE'});
        }
    });

})

router.post('/failed', (req, res) => {

     stripe.events.retrieve(req.body.id, function(err, event){
        if (event){

            if (!event.data.object.metadata.hasOwnProperty('type'))
            Organization.findOne({
                where:{stripe_id:event.data.object.customer},
                include:[OrganizationSubscription]
            }).then(
                organization => {
                    let subscription = organization.getDataValue('organization_subscription');

                    subscription.updateAttributes({
                        is_card_error:true,
                        renew_attempts:subscription.getDataValue('renew_attempts') + 1
                    });

                    User.findOne({
                        where:{
                            id:organization.getDataValue('create_user_id')
                        }
                    }).then(
                        user => {

                            let email = new EmailService();

                            email.configure({
                                language    : user.getDataValue('language'),
                                template    : 'subscriptionError',
                                to          : user.getDataValue('email')
                            });
                            
                            email.send();

                            res.json({message:'OK'});

                        }
                    )
                });
        }else{
            res.status(400);
            return res.json({message: 'ERROR_STRIPE'});
        }
    });
})
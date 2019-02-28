import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';

import {ConfigService} from './../services/configService';

import {User} from './../models/user/main';

import {AppCountry} from './../models/app_country';

import {UserRole} from './../models/user/user_role';
import {Patient} from './../models/user/patient/main';
import {OrganizationLimit} from './../models/organization/limit';
import {OrganizationSubscription} from './../models/organization/subscription';

import {organizationSubscriptionPayment} from './organizationSubscriptionPayment';

const env = process.env.APP_ENV || 'development';

const config = new ConfigService();

const stripe = require('stripe')(config.getConfig('stripe')[env]['secret_key']);

const router = Router();

const appDefaults = config.getConfig('default');
/*
export const updateUsers = (req:Request, res:Response) => {

    let subscription = req['organization'].getDataValue('organization_subscription');

    let limit = req['organization'].getDataValue('organization_limit');

    let defaultPrice = subscription.getDataValue('monthly_fee_base');

    let newPrice = subscription.getDataValue('monthly_fee_base');

    let newUsers = req.body.users_count;

    AppCountry.findOne({
        where:{
            currency_code:req['subscription'].getDataValue('currency_code')
        }
    }).then(appCountry => {

        UserRole.count({
            where:{
                organization_id:req['organization_id']
            }
        }).then(
            userCount => {
                if (userCount > newUsers){
                    return res.status(400).json({message:'EXCEEDED_USERS_COUNT'});
                }else{
                    stripe.customers.retrieve(
                        req['organization'].getDataValue('stripe_id'),
                        (err:any, customer:any) => {

                            var subId = customer.subscriptions.data[0].id;

                            let planId = req['organization_id'] + '-' + new Date().getTime();
                            stripe.plans.create({
                                amount: Number(newPrice)  * appCountry.getDataValue('minimum_prefix');,
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

                                        subscription.updateAttributes({
                                            monthly_fee:newPrice
                                        });

                                        limit.updateAttributes({
                                            users_count:newUsers
                                        });

                                        return res.json({message:'Ok'});
                                    }
                                );
                            });
                        }
                    );
                }
            }
        );
    });
}*/
router.all('*', (req, res, next) => {

    OrganizationSubscription.findOne({
        where:{organization_id:req['organization_id']}}).then(
        response => {
            req['subscription'] = response;
            next();
        }
    )

})

router.get('/', (req:Request, res:Response) => {
    res.json(req['subscription']);
});

router.get('/services', (req:Request, res:Response) => {

    AppCountry.findOne({
        where:{
            currency_code:req['subscription'].getDataValue('currency_code')
        }
    }).then(
        appCountry => {

            let response = {
                sms:{
                    units:appDefaults['subscription']['sms_units'],
                    price:appDefaults['subscription']['sms_fee'] * appCountry.getDataValue('rate_usd') * appDefaults['subscription']['sms_units']
                },
                storage:{
                    units:appDefaults['subscription']['storage_units'],
                    price:appDefaults['subscription']['storage_fee'] * appCountry.getDataValue('rate_usd') * appDefaults['subscription']['storage_units']
                }
            };

            res.json(response);

        }
    );

});

router.put('/', (req:Request, res:Response) => {
    let stripeToken = req.body.stripe_token;

    let subscription = req['organization'].getDataValue('organization_subscription');

    let limit = req['organization'].getDataValue('organization_limit');

    if (stripeToken)
    stripe.customers.createSource(
        req['organization'].getDataValue('stripe_id'), {
            source: stripeToken
        }, (err:any, card:any) => {
            if (!err) {
                stripe.customers.retrieve(
                    req['organization'].getDataValue('stripe_id'),
                    (err:any, customer:any) => {
                        if (!err){
                            let ccard = customer.default_source;
                            stripe.customers.update(req['organization'].getDataValue('stripe_id'), {
                                default_source: card.id
                            }, (err:any, customer:any) => {
                                stripe.customers.deleteCard(
                                    req['organization'].getDataValue('stripe_id'),
                                    ccard,
                                    (err:any, confirmation:any) => {
                                        subscription.updateAttributes({
                                            card_type:customer.sources.data[0].brand,
                                            card_last_digits:card.last4        
                                        });
                                    }
                                );
                                
                                subscription.setDataValue('card_last_digits', card.last4);
                                subscription.setDataValue('card_type', customer.sources.data[0].brand);

                                if (subscription.getDataValue('is_card_error') && subscription.getDataValue('renew_attempts') > 0){
                                    stripe.invoices.list(
                                        { customer: req['organization'].getDataValue('stripe_id') },
                                        (err:any, invoices:any) => {
                                            if (!invoices.data[0].paid)
                                            stripe.invoices.pay(invoices.data[0].id, (err:any, invoice:ANGLE_instanced_arrays) => {
                                                if (err){
                                                    res.status(400);
                                                    return res.json({message: 'UNABLE_TO_PAY_LAST'});
                                                }
                                                subscription.updateAttributes({
                                                    renew_attempts:0,
                                                    is_card_error:false        
                                                });
                                                
                                                res.json({subscription:subscription, stripe_customer:customer});

                                            });
                                        }
                                    );
                                }else{
                                    res.json({subscription:subscription, stripe_customer:customer});
                                }
                            });
                        }else{
                            res.status(400);
                            return res.json({message: 'NO_CUSTOMER_FOUND'});
                        }
                    }
                );
            }else{
                res.status(400);
                return res.json({message: 'UNABLE_TO_UPDATE'});
            }
        }
    );  
});

router.post('/recharge', (req:Request, res:Response) => {

    let subscription = req['organization'].getDataValue('organization_subscription');
    
    stripe.customers.retrieve(
        req['organization'].getDataValue('stripe_id'), (err:any, customer:any)  => {
            if (!err){
                if (subscription.getDataValue('is_card_error')){
                    stripe.invoices.list(
                        { customer: req['organization'].getDataValue('stripe_id') }, (err:any, invoices:any) => {
                            if (!invoices.data[0].paid)
                                stripe.invoices.pay(invoices.data[0].id, (err:any, invoice:any) => {
                                    if (err){
                                        res.status(400);
                                        return res.json({message: 'UNABLE_TO_RENEW'});
                                    }else{
                                        subscription.updateAttributes({
                                            is_card_error:false,
                                            renew_attempts:0
                                        });
                                        res.json(customer);
                                    }
                                });
                            else
                                res.status(400).json({message:'NO_NEED_RENEW'});
                        }
                    );
                }else{
                    res.status(400).json({message:'NO_NEED_RENEW'});
                }
            }else{
                res.status(400);
                return res.json({message: 'UNABLE_TO_PROCESS'});
            }
        }
    );
})

router.post('/', (req, res, next) => {

    let stripeToken = req.body.stripe_token;

    let planId = req['organization_id'] + '-' + new Date().getTime();

    let subscription = req['organization'].getDataValue('organization_subscription');

    let limits = req['organization'].getDataValue('organization_limit');

    let newUsers = req.body.users_count;

    let defaultPrice = subscription.getDataValue('monthly_fee');

    AppCountry.findOne({
        where:{
            currency_code:subscription.getDataValue('currency_code')
        }
    }).then(
        appCountry => {

            let stripePrice = defaultPrice * appCountry.getDataValue('minimum_prefix');

            if (req['organization'].getDataValue('stripe_id') != null){
                return res.status(400).json({message:'ALREADY_SUBSCRIBED'});
            }

            stripe.plans.create({
                amount: stripePrice,
                interval: "month",
                name: planId,
                currency: subscription.getDataValue('currency_code'),
                id: planId,
                trial_period_days: appDefaults['subscription']['trial_days']
            }, (err:any, plan:any) => { 
                console.log(err);   
                stripe.customers.create({
                    source: stripeToken,
                    plan: planId,
                    email: 'org'+ req['organization_id'] + '@dentaltap.com'
                }, (err:any, customer:any) => {
                    if (!err) {

                        subscription.updateAttributes({
                            expire_date:moment().add(appDefaults['subscription']['trial_days'], 'days').format('YYYY-MM-DD'),
                            card_type:customer.sources.data[0].brand,
                            card_last_digits:customer.sources.data[0].last4
                        });

                        limits.updateAttributes({
                            patients_count:0
                        });

                        req['organization'].updateAttributes({
                            stripe_id:customer.id
                        });

                        res.json({subscription:subscription, stripe_customer:customer, stripe_plan:plan});

                    }else{
                        console.log(err);
                        return res.status(400).json({message: 'UNABLE_TO_SUBSCRIBE'});
                    }
                })
            });
        }
    )
/*
    Patient.count({
        where:{
            organization_id:req['organization_id']
        }
    }).then(count => {

        OrganizationLimit.findById(req['organization_id']).then(
            organization_limit => {
                
            }
        )



    });
*/


});

router.use('/payments', organizationSubscriptionPayment);

export const organizationSubscription = router;
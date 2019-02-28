import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';

import {ConfigService} from './../services/configService';

import {User} from './../models/user/main';

import {AppCountry} from './../models/app_country';

import {UserRole} from './../models/user/user_role';
import {Patient} from './../models/user/patient/main';
import {OrganizationLimit} from './../models/organization/limit';
import {OrganizationSubscription} from './../models/organization/subscription';

const env = process.env.APP_ENV || 'development';

const config = new ConfigService();

const stripe = require('stripe')(config.getConfig('stripe')[env]['secret_key']);


const router = Router();

const smsCount = config.getConfig('default')['subscription']['sms_units'];

const storageSize = config.getConfig('default')['subscription']['storage_units'];

router.all('*', (req, res, next) => {
    

    req['subscription'] = req['organization'].getDataValue('organization_subscription');
    req['subscription_limit'] = req['organization'].getDataValue('organization_limit');

    next();

})

router.get('/', (req:Request, res:Response) => {

    req['subscription'].get_payments().then(
        (response:any) => {
            res.json(response);
        }
    )

});

router.post('/storage', (req:Request, res:Response) => {

    let storageFeeUSD = config.getConfig('default')['subscription']['storage_fee'];

    AppCountry.findOne({
        where:{
            currency_code:req['subscription'].getDataValue('currency_code')
        }
    }).then(
        appCountry => {
            let localPrice = storageFeeUSD * storageSize * appCountry.getDataValue('rate_usd');
            stripe.charges.create({
                amount: localPrice * appCountry.getDataValue('minimum_prefix'),
                currency: req['subscription'].getDataValue('currency_code'),
                customer: req['organization'].getDataValue('stripe_id'),
                metadata: {'type': 'sms'}
            }, (err:any, charge:any) => {

                if (!err){

                    req['subscription_limit'].updateAttributes({
                        storage_size_free: req['subscription_limit'].getDataValue('storage_size_free') + storageSize
                    });

                    req['subscription'].updateAttributes({
                        is_card_error:false
                    });

                    req['subscription'].add_payment({
                   //     subscription_id:req['subscription'].getDataValue('id'),
                        amount: localPrice,
                        currency_code:req['subscription'].getDataValue('currency_code'),
                        payment_type:'storage',
                        card_info:charge.source.brand.toUpperCase() + ' ****'+ charge.source.last4
                    }).then(
                        (response:any) => {
                            res.json(response);
                        }
                    );

                }else{
                    return res.status(400).json({message: 'UNABLE_TO_TOPUP'});
                }
            });
        }
    )

});

router.post('/sms', (req:Request, res:Response) => {

    let smsFeeUSD = config.getConfig('default')['subscription']['sms_fee'];

    AppCountry.findOne({
        where:{
            currency_code:req['subscription'].getDataValue('currency_code')
        }
    }).then(
        appCountry => {
            let localPrice = smsFeeUSD * appCountry.getDataValue('rate_usd') * smsCount;
            stripe.charges.create({
                amount: localPrice * appCountry.getDataValue('minimum_prefix'),
                currency: req['subscription'].getDataValue('currency_code'),
                customer: req['organization'].getDataValue('stripe_id'),
                metadata: {'type': 'sms'}
            }, (err:any, charge:any) => {

                if (!err){

                    req['subscription_limit'].updateAttributes({
                        sms_count: req['subscription_limit'].getDataValue('sms_count') + smsCount
                    });

                    req['subscription'].updateAttributes({
                        is_card_error:false
                    });

                    req['subscription'].add_payment({
                    //    subscription_id:req['subscription'].getDataValue('id'),
                        amount: localPrice,
                        currency_code:req['subscription'].getDataValue('currency_code'),
                        payment_type:'sms',
                        card_info:charge.source.brand.toUpperCase() + ' ****'+ charge.source.last4
                    }).then(
                        (response:any) => {
                            res.json(response);
                        }
                    );

                }else{
                    return res.status(400).json({message: 'UNABLE_TO_TOPUP'});
                }
            });
        }
    )

})

export const organizationSubscriptionPayment = router;

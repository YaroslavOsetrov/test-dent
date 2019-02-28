import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';

import * as urlencode from 'urlencode';

import {ConfigService} from './../services/configService';

import {Organization} from './../models/organization/main';

import {OrganizationScheduler} from './../models/organization/scheduler';

import {OrganizationDocument} from './../models/organization/document';

import {OrganizationProcedure} from './../models/organization/procedure';

import {OrganizationSubscription} from './../models/organization/subscription';

import {OrganizationPrice} from './../models/organization/price';

import {OrganizationLimit} from './../models/organization/limit';

import {User} from './../models/user/main';

import {UserRole} from './../models/user/user_role';

import {JWTService, JWTverify} from './../services/jwtService';

import {AppCountry} from './../models/app_country';

import {i18nService} from './../services/i18nService';

import {EmailService} from './../services/emailService';

import * as countries from './../../public/json/countries.json';

import * as Hubspot from 'hubspot';

import {_performLogin} from './login';

const router = Router();

const env = process.env.APP_ENV || 'development';

router.post('/', (req:Request, res:Response) => {
    let user = new User(req.body);

    user.country_code = _getCountryByPhone(req.body.phone);

    let phoneCodeSetted = _getPhoneCountryCode(req.body.phone);

    AppCountry.findOne({
        where:{
            phone_code:phoneCodeSetted
        }
    }).then(country => {

        if (country){
            user.country_code = country.getDataValue('country_code');
        }else{
            user.country_code = 'us';
        }

        let password_setted = user.set_password(req.body.password);
        
        if (!password_setted){
            res.status(400);
            return res.json({message: 'USER_PASSWORD_INCORRECT'});
        }
            
        user.validate().then((validated_user) => {

            user.save().then((user_account) => {

                let configService = new ConfigService();

                let hubspot = new (Hubspot as any)({apiKey:configService.getConfig('hubspot')});

                hubspot.contacts.createOrUpdate(user_account.getDataValue('email'), {
                    properties:[{
                        property:'email',
                        value:user_account.getDataValue('email')
                    },{
                        property:'firstname',
                        value:user_account.getDataValue('fullname')
                    },{
                        property:'phone',
                        value:user_account.getDataValue('phone')
                    },{
                        property:'country',
                        value:user_account.getDataValue('country_code')
                    }]
                });

                try{
                    _sendVerificationEmail(user_account);
                }catch(e){
                    console.log('Email_error:' + e);
                }
                

                _createOrganization(req, res, user_account);
                
            }).catch((e) => {
                console.log(e);
                return res.status(400).json({message:'INCORRECT_DATA'});
            });
        }).catch((e) => {
            return res.status(400).json({message:'INCORRECT_DATA'});
        });
    })   
});

router.post('/checkEmail', (req:Request, res:Response) => {
    if (!req.body.email)
        return res.status(400).json({message:'BAD_REQUEST'});

    User.findOne<User>({
        where:{
            email:req.body.email
        }
    }).then(
        response => {
            if (response){
                return res.status(400).json({message:'ALREADY_CONFIRMED'});
            }else{
                res.json({message:'Ok'});
            }
        }
    )
});

router.post('/initialLogin', (req:Request, res:Response) => {
    if (!req.body.account_id || !req.body.organization_id){
        return res.status(400).json({message:'BAD_REQUEST'});
    }

    _performLogin(req, res, req.body.account_id, req.body.organization_id);
});

export const registrationRouter = router;


export const _createOrganization = (req:Request, res:Response, user:User) => {

    let configService = new ConfigService();

    let _i18nService:i18nService = new i18nService();

    let defaultCurrency = 'USD';

    if (countries.hasOwnProperty(user.country_code)){
        defaultCurrency = countries[user.country_code].currency_code.toUpperCase();
    }

    let organization = new Organization({
        create_user_id  : user.id,
        language        : user.language,
        country_code    : user.country_code,
        currency_code   : defaultCurrency
    });

    organization.save().then(
        organization => {

            user.add_to_role(1, organization.id, true);

            AppCountry.findAll<AppCountry>({
                where:{
                    country_code:{
                        $in:[user.country_code, 'us']
                    }
                }
            }).then(
                countries => {

                    let countryTarget:any;
                    let countryDefault:any;

                    countries.forEach((row) => {
                        if (row.country_code == user.country_code)
                            countryTarget = row;
                        
                        if (row.country_code == 'us')
                            countryDefault = row;
                    })
                    
                    if (countries.length == 1)
                        countryTarget = countryDefault;

                    let appDefault = configService.getConfig('default');
                    let default_subscription = appDefault['subscription'];

                    let subscription =  new OrganizationSubscription();

                    subscription.expire_date = moment().add(default_subscription.trial_days, 'days').format();

                    if (countryTarget.getDataValue('is_billing_available')){
                        subscription.monthly_fee    = countryTarget.getDataValue('monthly_fee');
                        subscription.monthly_fee_base    = countryTarget.getDataValue('monthly_fee_base');
                        subscription.currency_code  = countryTarget.getDataValue('currency_code');
                    }
                    else{
                        subscription.monthly_fee    = countryDefault.getDataValue('monthly_fee');
                        subscription.monthly_fee_base    = countryDefault.getDataValue('monthly_fee_base');
                        subscription.currency_code  = countryDefault.getDataValue('currency_code');
                    }

                    let default_limit = appDefault['limit'];
                    let organization_limit = new OrganizationLimit({
                        patients_count  : countryTarget.getDataValue('patients_limit'),
                        storage_size_free    : countryTarget.getDataValue('storage_size'),
                        sms_count       : 0,
                        users_count     : 1
                    });

                    let price = _i18nService.getFile('price_default', user.getDataValue('language'));

                    let procedures = _i18nService.getFile('price', user.getDataValue('language'));

                    procedures.forEach((row) => {
                        row['organization_id'] = organization.getDataValue('id');
                    });

                    let organizationProceduresAdded = OrganizationProcedure.bulkCreate<OrganizationProcedure>(procedures);
                    
                    let organizationPriceAdded = organization.create_price(new OrganizationPrice({
                        price_list:JSON.stringify(price)
                    })); 

                    let notification = _i18nService.getFile('organization_notifications', user.getDataValue('language'));

                    let cabinets = _i18nService.getFile('cabinets_default', user.getDataValue('language'));
                    
                    let organizationDocs = [];
                    ['privacy', 'consent'].forEach((docName) => {
                        let docDetails = _i18nService.organization_documents(user.getDataValue('language'), docName);
                       
                       console.log(docDetails);
                        organizationDocs.push({
                            title:docName,
                            text:docDetails,
                            organization_id:organization.getDataValue('id')
                        });
                    })
                     console.log('------------------------------------------------------------------------');
                        console.log(organizationDocs);
                        console.log('------------------------------------------------------------------------');

                    let organizationDocumentsAdded = OrganizationDocument.bulkCreate<OrganizationDocument>(organizationDocs);


                    let organizationSchedulerAdded = OrganizationScheduler.create({
                        organization_id : organization.getDataValue('id'),
                        sections        : JSON.stringify(cabinets),
                        first_day_index : 1,
                        start_hour      : 8,
                        end_hour        : 19,
                        slot_duration   : 15,
                        hidden_days     : null
                    });
                    Promise.all([organizationSchedulerAdded, organizationProceduresAdded, organizationDocumentsAdded]).then(() => {
                        organization.create_subscription(subscription).then(
                            organization_subscription => {
                                
                                organization.setDataValue('organization_subscription', organization_subscription);

                                organization.create_limit(organization_limit).then(
                                    organization_limit => {

                                        organization.setDataValue('organization_limit', organization_limit);

                                        let jwt = new JWTService({
                                            account_id      : user.getDataValue('id'),
                                            organization_id : organization.getDataValue('id')
                                        }, default_subscription['trial_days']);
                                        
                                        res.json({
                                            user         : user,
                                            organization : organization,
                                            token        : jwt.get_token()
                                        });
                                    }
                                );
                            }
                        );
                    })
                }
            )
        }
    );
}


router.post('/confirmEmail', (req, res) => {

    try{
        let authorized_data = JWTverify(urlencode.decode(req.body.token));

        User.findOne<User>({
            where:{
                id:authorized_data['account_id']
            }
            }).then(
                user_account => {

                    if (!user_account){
                        return res.status(400).json({message:'BAD_REQUEST'});
                    }

                    if (user_account.getDataValue('is_email_confirmed')){
                        return res.status(400).json({message:'ALREADY_CONFIRMED'});
                    }else{
                        user_account.updateAttributes({
                            is_email_confirmed:true
                        });

                        res.json({message:'Ok'});
                    }

                }
            )

    }catch(err){
        res.status(400).json({message:'BAD_TOKEN'});
    }
});

router.post('/sendConfirmation', (req, res) => {

    User.findOne<User>({
        where:{
            email:req.body.email,
            id:req.body.id
        }
    }).then(
        user_account => {

            _sendVerificationEmail(user_account);

            res.json({message:'Ok'});
        }
    );
});

export const _sendVerificationEmail = (user_account:User) => {

    let jwt = new JWTService({
        account_id      : user_account.getDataValue('id'),
        email           : user_account.getDataValue('email')
    }, 2);

    let email = new EmailService();

    email.configure({
        language    : user_account.getDataValue('language'),
        template    : 'accountVerification',
        to          : user_account.getDataValue('email')
    });

    email.replaceHtml({
        email               : user_account.getDataValue('email'),
        token               : jwt.get_token(),
        fullname            : user_account.fullname,
        account_id          : user_account.getDataValue('id')
    });

  //  email.send();

}


export const _getPhoneCountryCode = (phone) => {
    let startI = 0;

    if (phone.indexOf('(') == -1)
        startI = phone.indexOf('-');
    else
        startI = phone.indexOf('(');

    return phone.substring(0, startI).replace('+', '');

}    

export const _getCountryByPhone = (phone_number:string) => {
    
        let res = 'us';

        let i18n = new i18nService();


        let countries = i18n.getFile('countries', 'en');

        for (let key in countries){

            let code = '+' + countries[key].phone;

            if (phone_number.indexOf(code) !== -1){ 
                res = key;
                break;
                
            }
        }
        return res;
    }
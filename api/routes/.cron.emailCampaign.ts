import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';

import {Appointment} from './../models/appointment/main';

import {Patient} from './../models/user/patient/main';

import {User} from './../models/user/main';

import {UserRole} from './../models/user/user_role';

import {Organization} from './../models/organization/main';

import {OrganizationLimit} from './../models/organization/limit';

import {OrganizationSubscription} from './../models/organization/subscription';
import {OrganizationEmailCampaign} from './../models/organization/email_campaign';

import {EmailService} from './../services/emailService';

const router = Router({mergeParams:true});


const calculateMessageSize = (message:any) => {

    let bytes = encodeURI(message).split(/%..|./).length - 1;

    return Math.ceil(bytes/140);
}

const settings ={
    schedule_days:[1,4,7,10,13],
    email_folder:'initial'
}

router.get('/init', (req, res) => {

    Organization.findAll<Organization>({
        include:[{
            model:OrganizationEmailCampaign,
            required:false
        }],
    }).then(
        response => {

            let noCampaignOrganizationIds = [];
            response.forEach((row) => {
                if (row.getDataValue('organization_email_campaign') == null){
                    noCampaignOrganizationIds.push(row.getDataValue('id'))
                }
            });

            let newCampaigns = [];

            noCampaignOrganizationIds.forEach((orgId) => {
                newCampaigns.push({organization_id:orgId, is_subscribed:true})
            });

            OrganizationEmailCampaign.bulkCreate<OrganizationEmailCampaign>(newCampaigns).then(
                response => {
                    res.json({message:'Ok'});
                }
            )

        }
    )
})

router.get('/sendTest', (req, res) => {
    

    let email = new EmailService();

    let hourNow = Number(moment.utc().format('HH'));

    console.log('ololowa');
    
    email.configure({
        language    : 'en',
        template    : 'email1',
        templatePath: 'initial',
        isLayout    : true,
        to          : 'yaroslav@dentaltap.com'
    });

    email.replaceHtml({
        fullname            : 'Yaro',   
    });
    try{
        email.send();
    }catch(e){
        console.log(e);
    }
    


})
/*
router.get('/weeklyReport', (req, res) => {
    let interval ={
        start:moment().add(-7, 'days').format('YYYY-MM-DD'),
        end:moment().format('YYYY-MM-DD')
    };

      OrganizationEmailCampaign.findAll({
        where:{
            createdAt:{
                $gte:interval.start,
                $lte:interval.end
            },
            is_subscribed:true
        }
    }).then(
        response => {
            response.forEach((row) => {

                let daysDiff = moment().diff(moment(row.getDataValue('createdAt')), 'days');

                let emailDayIndex = -1;

                settings.schedule_days.forEach((day, index) => {

                    if (day == daysDiff){
                        emailDayIndex = index+1;
                    }
                })

                UserRole.findAll({
                    where:{
                        organization_id:row.getDataValue('organization_id')
                    },
                    include:[User]
                }).then(
                    organizationUsers => {

                        organizationUsers.forEach((user) => {
                            Promise.all([
                                Appointment.count({
                                    where:{
                                        create_user_id:user.getDataValue('id'),
                                        date:{
                                            $gte:interval.start,
                                            $lte:interval.end
                                        }
                                    }
                                }),
                                Appointment.count({
                                    where:{
                                        create_user_id:user.getDataValue('id'),
                                        date:{
                                            $gte:interval.start,
                                            $lte:interval.end
                                        }
                                    }
                                })
                            ])
                        })

                    }
                )

                if (emailDayIndex != -1){

                    Organization.findOne({
                        include:[User, OrganizationSubscription],
                        where:{
                            id:row.getDataValue('organization_id')
                        }
                    }).then(
                        organization => {
                            


                        }
                    )

                }
            });
        }
    );
})
*/
router.get('/send', (req, res) => {

    let today = moment().format('YYYY-MM-DD');

    let maxLastDay = Math.max(...settings.schedule_days);

    let interval ={
        start:moment().add(maxLastDay * -1, 'days').format('YYYY-MM-DD'),
        end:moment().format('YYYY-MM-DD')
    };

    OrganizationEmailCampaign.findAll({
        where:{
            createdAt:{
                $gte:interval.start,
                $lte:interval.end
            },
            is_subscribed:true
        }
    }).then(
        response => {
            response.forEach((row) => {

                let daysDiff = moment().diff(moment(row.getDataValue('createdAt')), 'days');

                let emailDayIndex = -1;

                settings.schedule_days.forEach((day, index) => {

                    if (day == daysDiff){
                        emailDayIndex = index+1;
                    }
                })

                if (emailDayIndex != -1){


                    Organization.findOne({
                        include:[User, OrganizationSubscription],
                        where:{
                            id:row.getDataValue('organization_id')
                        }
                    }).then(
                        organization => {



                            let user_account = organization.getDataValue('organization_user');

                            let subscription = organization.getDataValue('organization_subscription');

                            let email = new EmailService();

                            let hourNow = Number(moment.utc().format('HH'));

                            if (hourNow + user_account.getDataValue('timezone_offset')/60 == 12){
                                  

                            email.configure({
                                language    : user_account.getDataValue('language'),
                                template    : 'email'+emailDayIndex,
                                templatePath: 'initial',
                                isLayout    : true,
                                to          : user_account.getDataValue('email')
                            });

                            email.replaceHtml({
                                fullname            : user_account.getDataValue('fullname'),
                               
                            });

                            if (subscription){
                                email.replaceHtml({
                                    fee_clinic          : Number(subscription.getDataValue('monthly_fee_base')) * 2 + '+ ' + subscription.getDataValue('currency_code'),
                                    fee_solo          : Number(subscription.getDataValue('monthly_fee_base')) + ' ' + subscription.getDataValue('currency_code')
                                })
                            }

                            email.send();
                            }

                        }
                    )

                   

                }

            })
        }
    )

    res.json({message:'Ok'});

})

export const cronEmailCampaign = router;
import {Router, Request, Response, RequestHandler} from 'express';

import {Appointment} from './../models/appointment/main';

import {Organization} from './../models/organization/main';

import {OrganizationLog} from './../models/organization/log';

import {User} from './../models/user/main';

import {Patient} from './../models/user/patient/main';

import {UserRole} from './../models/user/user_role';

import {UserProcedure} from './../models/user/procedure';

import {UserWorkhour} from './../models/user/workhour';

import {ConfigService} from './../services/configService';

import * as moment from 'moment';

import {OrganizationLimit} from './../models/organization/limit';
import {OrganizationNotification} from './../models/organization/notification';

import {WidgetAppointmentRequest, WidgetAppointmentSettings} from './../models/widget/appointment';

const router = Router();

const reCAPTCHA=require('recaptcha2');


const createAppt = (req, res) => {


    Patient.findOne({
        where:{
            organization_id:req.body.organization_id
        },
        include:[{
            model:User,
            required:true,
            where:{
                phone:req.body.phone
            }
        }]
    }).then(
        patient => {

            if (patient){
                req.body.patient_id = patient.getDataValue('id');
            }

            WidgetAppointmentRequest.create<WidgetAppointmentRequest>(req.body).then(
                response => {
                    res.json({message:'ok'});
                }
            ).error(
                e => {
                    console.log(e);
                    res.status(400).json({message:'BAD_REQUEST'});
                }
            )

        }
    )

    
}
/*
router.all('/:code*', (req, res, next) => {

    let code = req.params.code;

    if (Number(code) == 0){
        code = req['account_id'];
    }
    
    Organization.findOne<Organization>({
        where:{
            create_user_id:code
        }
    }).then(
        response => {
            if (!response){
                return res.status(404).json({message:'NOT_FOUND'});
            }

            WidgetAppointmentSettings.findOne({
                where:{
                    organization_id:response.getDataValue('id')
                }
            }).then(
                widgetSettings => {
                    req['widget'] = widgetSettings;
                    req['organization'] = response;
                    next();
                }
            )
        }
    )

})
*/

router.get('/:organizationId/:providerId', (req, res) => {


    Promise.all([
        Organization.findOne<Organization>({
            where:{
                id:req.params.organizationId
            }
        }),
        User.findOne<User>({
            where:{
                id:req.params.providerId
            }
        })
    ])
    .then(response => {
        
        if (!response[0] || !response[1])
            return res.status(404).json({message:'NOT_FOUND'});

        res.json({
            organization:response[0],
            provider:response[1]
        });
    })

})

router.get('/:organizationId/:providerId/freeSlots/:start/:end', (req, res) => {

    var interval = {
        start:req.params.start,
        end: req.params.end
    };

    if (
        (!moment(interval.start, 'YYYY-MM-DD', true).isValid() || !moment(interval.end, 'YYYY-MM-DD', true).isValid()) ||
        moment(interval.start) > moment(interval.end) || 
        moment(interval.end).diff(moment(interval.start), 'days') > 7
    ){
        res.status(400);
        return res.json({message: 'Bad Request.'});
    }
    


    UserWorkhour.findAll<UserWorkhour>({
        where:{
            user_id:req.params.providerId,
            organization_id:req.params.organizationId,
            date: {
                $lte: interval.end,
                $gte: interval.start
            }
        }
    }).then(workhours => {

        Appointment.findAll<Appointment>({
            where:{
                provider_id:req.params.providerId,
                date: {
                    $lte: interval.end,
                    $gte: interval.start
                }
            }
        }).then(appointments => {
            
            let days = {};

            for (let m = moment(interval.start); m.isSameOrBefore(moment(interval.end)); m.add(1, 'days')) {
                days[m.format('YYYY-MM-DD')] = [];
            }

            workhours.forEach((row) => {

                let intervalMinutes = 30;

                let start = moment.utc(row.start_time);

                let startMinutes = Number(moment.utc(row.start_time).format('mm'));
                if (startMinutes == 15 || startMinutes == 45){
                    start.add(15, 'minutes');
                }

                for (let m = start; m.isSameOrBefore(moment.utc(row.end_time)); m.add(intervalMinutes, 'minutes')){
                    let index = days[moment.utc(row.date).format('YYYY-MM-DD')].find((row, i) => {
                        if (row['time'] == m.format('HH:mm'))
                            return i;
                    })
                    if (!index)
                        days[moment.utc(row.date).format('YYYY-MM-DD')].push({room_id:row['room_id'], office_id:row['office_id'], time:m.format('HH:mm')});
                }

            })

            appointments.forEach((appt) => {

                let start = moment.utc(appt.start_time);
                let end = moment.utc(appt.end_time);

                let startMinutes = Number(moment.utc(appt.start_time).format('mm'));
                if (startMinutes == 15 || startMinutes == 45){
                    start.add(-15, 'minutes');
                }

                let endMinutes = Number(moment.utc(appt.end_time).format('mm'));
                if (endMinutes == 15 || endMinutes == 45){
                    end.add(15, 'minutes');
                }                

                for (let m = start; m.isBefore(moment.utc(end)); m.add(30, 'minutes')){

                    console.log(m.format('HH:mm'));

                    let index = days[moment.utc(appt.date).format('YYYY-MM-DD')].find((row, i) => {
                        if (row['time'] == m.format('HH:mm'))
                            return i;
                    })

                    days[moment.utc(appt.date).format('YYYY-MM-DD')].splice(index, 1);

                }
            })

            res.json(days);

        })
    })
    


});

router.get('/:code/settings', (req, res) => {

    res.json({widget:req['widget'], organization:req['organization']});
});

router.get('/:code/providers', (req, res, next) => {

    User.findAll<User>({
        include:[{
            model:UserRole,
            where:{
                organization_id:req['organization'].getDataValue('id'),
                is_doctor:1
            }
        }, {
            model:UserProcedure,
            where:{
                organization_id:req['organization'].getDataValue('id')
            },
            required:false
        }],
        order:[['fullname', 'DESC']]
    }).then(
        response => {

            res.json(response);

        }
    );
})

router.post('/:organizationId/:providerId/add', (req, res) => {

    req.body.organization_id = req.params.organizationId;


    let configService = new ConfigService();

    let recaptchaConfig = configService.getConfig('recaptcha');

    let recaptcha=new reCAPTCHA({
        siteKey:recaptchaConfig.site_key,
        secretKey:recaptchaConfig.secret_key
    });

    createAppt(req, res);
/*
    recaptcha.validateRequest(req)
    .then(function(){
        createAppt(req, res);
    })
    .catch(function(errorCodes){
        console.log(errorCodes);
        res.status(400).json({message:'CAPTCHA_ERROR'});
    });
*/
})



export const bookRouter = router;
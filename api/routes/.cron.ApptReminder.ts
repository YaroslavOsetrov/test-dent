import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';

import {Appointment} from './../models/appointment/main';

import {Patient} from './../models/user/patient/main';

import {User} from './../models/user/main';

import {Organization} from './../models/organization/main';



import {OrganizationLimit} from './../models/organization/limit';
import {OrganizationNotification} from './../models/organization/notification';

import * as smsс from 'node-smsc';

const router = Router({mergeParams:true});


const calculateMessageSize = (message:any) => {

    let bytes = encodeURI(message).split(/%..|./).length - 1;

    return Math.ceil(bytes/140);
}

const smscData = {
    '490':{
        email:'info@dentospas.ru',
        password_hash:'113aababc02ce801ad41345033c866d0'
    },
    '402':{
        email:'redmilk2@yandex.ru',
        password_hash:'d83bee2610a7ebea12ca46db4cc169c8'
    }
};

moment.locale('ru');

const settings = {
    create:{
        interval:{
            start: moment.utc().add(-1, 'days'),
            end: moment.utc().add(20, 'minutes')
        },
        notification:'create_appt',
        field:'createdAt',
        apptField:'date',
        message_field:'Вы записаны на прием к стоматологу на {dateD}.{dateM} в {time}. Тел: 8(495)3731025. Адрес: м.Алтуфьево, Шенкурский проезд, д.3Б (3 этаж). Схема прохода: https://yandex.ru/maps/org/1685966636',
        where:{
            createdAt: {
                $gte: moment.utc().add(-2, 'days').format(),
                $lte: moment.utc().add(20, 'minutes').format()
            },
            date:{
                $gte:moment().startOf('day').format()
            },
          //  notify_create:true,
            notify_create_sent:false,
            is_deleted:false,
            organization_id:490
        }
    },
    before:{
        interval:{
            start: moment().startOf('day'),
            end: moment().startOf('day').add(1, 'days')
        },
        notification:'confirm_appt',
        field:'date',
        apptField:'date',
        message_field:'Напоминаем, что у Вас назначен визит к стоматологу {dateD}.{dateM} в {time}. Тел.: 8(495)3731025.',
        where:{
            date: {
                $gte: moment().startOf('day').format(),
                $lte: moment().startOf('day').add(1, 'days').format()
            },
         //   notify_before:true,
            notify_before_sent:false,
            is_deleted:false,
            organization_id:490
        }
    }
}


router.get('/:type', (req:Request, res:Response) => {

    let type = req.params.type;

    if (!type){
        return res.status(400).json({message:'BAD_REQUEST'});
    }

  //  console.log(settings[type].where);

    Appointment.findAll({
       where:settings[type].where,
       include:[{
           model:Organization, 
           include:[OrganizationLimit, OrganizationNotification]
       }, {
           model:Patient,
           include:[User]
       }]
    }).then(
        response => {

            let responseData = [];

            let output = [];

            console.log(response.length);

            response.forEach((row) => {
               // console.log(row);
                if (row.getDataValue('patient_id') != null){

                    let organization = row.getDataValue('organization');

                    let patient_user = row.getDataValue('patient').getDataValue('patient_user');

                    let limit = row.getDataValue('organization').getDataValue('organization_limit');

                    let notification = row.getDataValue('organization').getDataValue('organization_notification');

                    let timezone = organization.getDataValue('timezone_offset');

                    let localDate = moment.utc(row.getDataValue(settings[type].field)).add(timezone, 'minutes');

                    let apptDate = moment.utc(row.getDataValue(settings[type].apptField)).add(timezone, 'minutes');
                    
                    let cond = null;

                    let phone = patient_user.getDataValue('phone').replace(/\D/g,'');

                 //   console.log(timezone);
                 //   console.log(moment.utc().add(timezone * -1, 'minutes').format('HH'));

                    switch(type){
                        case 'before': cond = Number(moment.utc().add(timezone * -1, 'minutes').format('HH')) >= 10; break;
                        case 'create': cond = localDate.isBetween(settings[type].interval.start, settings[type].interval.end); break;

                        default: cond = null;
                    }

                 //   console.log(type);
                 //   console.log(cond);

                    if (cond != null){

                        let message = notification.getDataValue(settings[type].notification);
                    

                        let time = moment.utc(row.getDataValue('start_time')).format('HH:mm');
                    
                        message = message.replace(/{dateM}/g, apptDate.format('MMM'))
                                .replace(/{dateD}/g, moment(row.getDataValue('date')).format('DD'))
                                .replace(/{time}/g, time);

                        message = message.replace(/\*\|fullname\|\*/g, patient_user.getDataValue('fullname'));
                        message = message.replace(/\*\|date\|\*/g, moment(row.getDataValue('date')).format('DD MMMM'));
                        message = message.replace(/\*\|time\|\*/g, time);

                        message = message.replace(/\*\*PATIENT-NAME\*\*/g, patient_user.getDataValue('fullname'));
                        message = message.replace(/\*\*DATE\*\*/g, moment(row.getDataValue('date')).format('DD MMMM'));
                        message = message.replace(/\*\*TIME\*\*/g, time);

                        if (Object.keys(smscData).indexOf(organization.getDataValue('id').toString()) != -1){

                            let smscSettings = smscData[organization.getDataValue('id').toString()];

                            if (type == 'create')
                                row.updateAttributes({
                                    notify_create_sent:true
                                });
                            else if (type == 'before')
                                row.updateAttributes({
                                    notify_before_sent:true
                                });
                            

                            limit.updateAttributes({
                        //      sms_count:limit.getDataValue('sms_count')-smsCount
                            });

                          //  if (organization.getDataValue('id') == 490){

                                let smsc = require('node-smsc')({
                                    login: smscSettings.email,
                                    password:  smscSettings.password_hash,
                                    hashed: true
                                });

                                output.push({
                                    message:message,
                                    createdAt_or_apptDate:localDate.format('YYYY-MM-DD ---- HH:mm'),
                                    type:type,
                                    organization_id:organization.getDataValue('id')
                                });

                              
                                smsc.send({
                                    phones: phone,
                                    mes: message,
                                }).then(function(data){
                                    console.log('phone -' + phone);
                                    console.log(message);
                                }).catch(function(err){
                                    console.log(err);
                                });
                         //   }
                        
                                                

                        }

                        

                    }
                }

            });
            
            res.json(output);

        }
    )

})




export const cronApptReminder = router;
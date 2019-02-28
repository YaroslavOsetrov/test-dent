import {Router, Request, Response, RequestHandler} from 'express';

import {Appointment} from './../models/appointment/main';

import {Organization} from './../models/organization/main';

import {db} from './../models/index';

import {User} from './../models/user/main';

import {Patient} from './../models/user/patient/main';

import {OrganizationLimit} from './../models/organization/limit';
import {OrganizationNotification} from './../models/organization/notification';

import {cronApptReminder} from './.cron.ApptReminder';

import {OrganizationCall} from './../models/organization/call';

import {cronEmailCampaign} from './.cron.emailCampaign';

const router = Router();


router.post('/:userId/:eventType', (req, res) => {

    let phoneNumber = req.body.phone_number;

    console.log(phoneNumber);

    if (['incoming', 'exit'].indexOf(req.params.eventType) == -1){
        return res.status(400).json({message:'bad_request'});
    }

    Organization.findOne({
        where:{
            create_user_id:req.params.userId
        }
    }).then(
        organization => {

            if (organization)
            User.findAll({
                where:({
                    phone:db.Sequelize.literal("REPLACE(REPLACE(REPLACE(REPLACE([phone], '+', ''), ')', ''), '(', ''), '-', '') LIKE '" + phoneNumber + "'")
                } as any)
            }).then(
                users => {

                    let userIds = [];
                    users.forEach((row) => {
                        userIds.push(row.getDataValue('id'));
                    });

                    Patient.findOne({
                        where:{
                            user_id:userIds,
                            organization_id:organization.getDataValue('id')
                        }
                    }).then(
                        patient => {
                            if (patient)
                            OrganizationCall.findOne({
                                where:{
                                    organization_id:organization.getDataValue('id'),
                                    patient_id:patient.getDataValue('id')
                                }
                            }).then(
                                response => {
                                    if (response){
                                        response.destroy();
                                    }

                                    let user:any;
                                    users.forEach((row) => {
                                        if (row.getDataValue('id') == patient.getDataValue('user_id'))
                                            user = row;
                                    })

                                    if (req.params.eventType != 'exit'){
                                        
                                        
                                        OrganizationCall.create({
                                            organization_id:organization.getDataValue('id'),
                                            patient_id:patient.getDataValue('id'),
                                            status:req.params.eventType,
                                            patient_data:JSON.stringify({
                                            phone_number:user.getDataValue('phone'),
                                            fullname:user.getDataValue('fullname'),
                                            balance:patient.getDataValue('balance')
                                            })
                                        })

                                        return res.json({message:'Ok'});
                                    }else{
                                        OrganizationCall.destroy({
                                            where:{
                                                organization_id:organization.getDataValue('id'),
                                                patient_id:patient.getDataValue('id')
                                            }
                                        })
                                        return res.json({message:'Ok'});
                                    }
                                }
                            )
                        }
                    )
                }
            )
        }
    )
     
    

});

export const uiscomRouter = router;
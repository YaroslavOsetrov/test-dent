import {Router, Request, Response, RequestHandler} from 'express';

import {Appointment} from './../models/appointment/main';

import {Organization} from './../models/organization/main';

import {OrganizationLog} from './../models/organization/log';

import {User} from './../models/user/main';

import {UserProcedure} from './../models/user/procedure';

import {UserRole} from './../models/user/user_role';

import {OrganizationLimit} from './../models/organization/limit';
import {OrganizationNotification} from './../models/organization/notification';

import {WidgetAppointmentRequest, WidgetAppointmentSettings} from './../models/widget/appointment';

const router = Router();


router.all('/', (req, res, next) => {


    WidgetAppointmentSettings.findOne({
        where:{
            organization_id:req['organization_id']
        }
    }).then(
        widgetSettings => {
            
            if (!widgetSettings && req.method == 'GET'){
                return res.json(null);
            }

            UserProcedure.findAll({
                where:{
                    organization_id:req['organization_id']
                }
            }).then(
                userProcedures => {

                    let widget = null;
                    
                    if (widgetSettings)
                        widget = {
                            is_enabled:widgetSettings.getDataValue('is_enabled'),
                            success_text:widgetSettings.getDataValue('success_text'),
                            user_procedures:userProcedures
                        };

                    req['widget'] = widget;

                    next();
                }
            )

            
        }
    )
})

router.get('/', (req, res) => {

    res.json(req['widget']);

})

router.put('/', (req, res) => {


    let records = [];

    if (req.body.procedure_indexes){
        for (let provider in req.body.procedure_indexes){

            let procedure_indexes:any = provider;

            for (let procedureIndex in req.body.procedure_indexes[provider]){

                records.push({
                    user_id:provider,
                    organization_id:req['organization_id'],
                    procedure_index:procedureIndex
                })

            }

        }


        console.log(records);
        UserProcedure.destroy({
            where:{
                organization_id:req['organization_id']
            }
        }).then(
            response => {
                UserProcedure.bulkCreate<UserProcedure>(records).then(
                    response => {
                        
                    }
                )
            }
        )

        
    }

    

    if (!req['widget']){

        WidgetAppointmentSettings.create<WidgetAppointmentSettings>({
            organization_id:req['organization_id'],
            is_enabled:req.body.is_enabled,
            success_text:req.body.success_text
        }).then(
            response => {
                res.json({message:'Ok'});
            }
        )

    } else {

        req['widget'].updateAttributes({
            is_enabled:req.body.is_enabled,
            success_text:req.body.success_text
        })

        res.json({message:'Ok'});

    }
        



})

export const organizationWidgetRouter = router;
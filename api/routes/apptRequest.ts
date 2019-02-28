import {Router, Request, Response, RequestHandler} from 'express';

import {Appointment} from './../models/appointment/main';

import {User} from './../models/user/main';

import {Patient} from './../models/user/patient/main';

import {WidgetAppointmentRequest, WidgetAppointmentSettings} from './../models/widget/appointment';

import * as moment from 'moment';

const router = Router();


router.get('/:startDate/:endDate', (req, res, next) => {

    var interval = {
        start:req.params.startDate,
        end: req.params.endDate
    };

    if (
        (!moment(req.params.startDate, 'YYYY-MM-DD', true).isValid() || !moment(req.params.endDate, 'YYYY-MM-DD', true).isValid()) ||
        moment(req.params.startDate) > moment(req.params.endDate)
    ){
        res.status(400);
        return res.json({message: 'Bad Request.'});
    }

    WidgetAppointmentRequest.findAll({
        where:{
            organization_id:req['organization_id'],
            date: {
                $lte: interval.end,
                $gte: interval.start
            }
        },
        include:[{
            model:Patient,
            required:false,
            include:[User]
        }]
    }).then(
        response => {
            res.json(response);
        }
    )

});

router.delete('/:id', (req, res) => {
    WidgetAppointmentRequest.findOne({
        where:{
            organization_id:req['organization_id'],
            id:req.params.id
        },
    }).then(
        response => {
            if (!response){
                return res.status(404).json({message:'NOT_FOUND'});
            }
            response.destroy();

            res.json({message:'Ok'});
        }
    )
})

export const apptRequestRouter = router;
import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';
import {db} from './../models';

import {Appointment} from './../models/appointment/main';

import {Patient} from './../models/user/patient/main';

import {User} from './../models/user/main';

import {PatientInvoice} from './../models/user/patient/invoice/main';

import {PatientProcedure} from './../models/user/patient/procedure';

const models = db.models;
const router = Router({mergeParams:true});
/*
router.get('/:startDate/:endDate', (req:Request, res:Response) => {

     var interval: {start:string, end:string} = {
        start:req.params.startDate,
        end: req.params.endDate
    };

    if (
        (!moment(req.params.startDate, 'YYYY-MM-DD', true).isValid() || !moment(req.params.endDate, 'YYYY-MM-DD', true).isValid()) ||
        moment(req.params.startDate) > moment(req.params.endDate)
    ){
        res.status(400);
        return res.json({message: 'INCORRECT_DATE'});
    }

    let whereClause = ;

    if (!req['user_role']['edit_payment']){
        res.status(400).json({message:'NO_ACCESS'});
    }


    PatientInvoice.findAll<PatientInvoice>({
        where:{
            organization_id:req['organization_id'],
            expire_date:{
                $or:[{
                    $gte: interval.start,
                    $lte: interval.end
                }, {
                    $eq:null
                }]
            },
            total_amt:db.Sequelize.literal('total_amt-total_amt*discount/100+total_amt*tax/100-payed_amt > 0')
        },
        include:[{
            model:Appointment, 
            where:{
                date:{
                    $gte: interval.start,
                    $lte: interval.end
                }
            }
        }, {
            model:Patient,
            include:[User]
        }]
    }).then(
        response => {
            res.json(response);
        }
    )

})

*/

export const organizationInvoiceRouter = router;
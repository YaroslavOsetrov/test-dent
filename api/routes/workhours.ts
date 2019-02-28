import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';


import {Patient} from './../models/user/patient/main';
import {User} from './../models/user/main';
import {UserWorkhour} from './../models/user/workhour';

import {apptFreeCells} from './apptFreeCells';

const router = Router();

router.post('/', (req, res) => {

    req.body.organization_id = req['organization_id'];
    
    UserWorkhour.create<UserWorkhour>(req.body).then(
        response => {
            res.json(response);
        }
    )
    
})

router.get('/:startDate/:endDate', (req:Request, res:Response) => {

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

    UserWorkhour.findAll<UserWorkhour>({
        where:{
            date: {
                $lte: interval.end,
                $gte: interval.start
            },
            organization_id:req['organization_id']
        }        
    }).then(
        response => {
            res.json(response);
        }
    )

});

router.delete('/:workhourId', (req, res) => {

    UserWorkhour.findOne({
        where:{
            id:req.params.workhourId,
            organization_id:req['organization_id']
        }
    }).then(
        response => {
            if (response){
                response.destroy();
                res.json({message:'Ok'});
            }
        }
    )

})

export const workhoursRouter = router;
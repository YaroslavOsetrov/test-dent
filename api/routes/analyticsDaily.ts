import {Router, Request, Response, RequestHandler} from 'express';
import * as moment from 'moment';


import {db} from './../models/index';

const router = Router({mergeParams:true});


router.all('*', (req, res, next) => {

    req['start_date'] = req.params.startDate;
    next();
});

router.get('/scheduler', (req, res) => {

    

    Promise.all([
        db.query('SELECT * FROM StatsPaymentsOrganization WHERE organization_id=:organization_id AND date_day = \'' +req['start_date']+'\'', {
            replacements:{
                organization_id:req['organization_id']
            },
            type: db.Sequelize.QueryTypes.SELECT
        }),
        db.query('SELECT * FROM StatsAppointmentsOrganization WHERE organization_id=:organization_id AND date_day = \'' +req['start_date']+'\'', {
            replacements:{
                organization_id:req['organization_id']
            },
            type: db.Sequelize.QueryTypes.SELECT
        }),
        db.query('SELECT * FROM StatsPatientsOrganization WHERE organization_id=:organization_id AND date_day = \'' +req['start_date']+'\'', {
            replacements:{
                organization_id:req['organization_id']
            },
            type: db.Sequelize.QueryTypes.SELECT
        })
    ]).then(response => {

        let output = {};
        
        output['total_appts'] = (response[1].length > 0) ? response[1][0].total : 0;
        output['cancelled_appts'] = (response[1].length > 0) ? response[1][0].cancelled : 0;
        output['new_patients'] = (response[2].length > 0) ? response[2][0].new_patients : 0;
        output['paid_amt'] = (response[0].length > 0) ? response[0][0].paid_amt : 0;

        res.json(output);
    })

})


export const analyticsDailyRouter = router;
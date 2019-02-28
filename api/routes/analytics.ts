import {Router, Request, Response, RequestHandler} from 'express';
import * as moment from 'moment';

import {User} from './../models/user/main';

import {db} from './../models/index';

const router = Router({mergeParams:true});

const formatOutput = (interval:any, response:any, explictFormat?:string) => {

    let outResponse = {};

   /* response.forEach((row) => {
        row
    })
*/
    let sample = Object.assign({}, response[0]);

    let field_name = 'date_day';

    for (let key in sample){
        if (key != 'provider_id' && key != 'organization_id'){
            sample[key] = null;
        }
        if (key == 'date_month'){
            field_name = 'date_month';
        }
    }

    response.forEach((row) => {
        row[field_name] = moment(row[field_name]).format('YYYY-MM-DD');
    });

    if (response.length == 0)
        field_name = 'date_' + explictFormat.toLowerCase();

    if (explictFormat != 'Month'){
        field_name = 'date_day';
    } 

    let outInterval = [];
    for (var m = moment(interval.start); m.isSameOrBefore(interval.end); m.add(1, (field_name == 'date_day')?'day':'month')) {
        outInterval.push(m.format('YYYY-MM-DD'));
        
    }
    response.forEach((row:any, i) => {

        let index = outInterval.indexOf(row[field_name]);

        if (!outResponse.hasOwnProperty(outInterval[index])){
             outResponse[outInterval[index]] = [];
        }
        
        outResponse[outInterval[index]].push(row);
    })

    let outResult:Array<string> = [];
    outInterval.forEach((date) => {
        if (!outResponse.hasOwnProperty(date)){
            let sample2 = Object.assign({}, sample);
            sample2[field_name] = date;
            outResult.push(sample2); 
        }else{
            outResponse[date].forEach((item:any) => {
                outResult.push(item);
            })
        }
    })

    console.log(outInterval);

    console.log(outResponse);
    return outResult;



}

router.all('*', (req, res, next) => {

    req['start_date'] = req.params.startDate;
    req['end_date'] = req.params.endDate;

    
    if (req['start_date'] && req['end_date'])
    if (
        (!moment(req['start_date'], 'YYYY-MM-DD', true).isValid() || !moment(req['end_date'], 'YYYY-MM-DD', true).isValid()) ||
        moment(req['start_date']) > moment(req['end_date'])
    ){
        res.status(400);
        return res.json({message: 'INVALID_INTERVAL'});
    }else{
        let duration = moment.duration(moment(req['end_date'], 'YYYY-MM-DD', true).diff(moment(req['start_date'], 'YYYY-MM-DD', true))).asMonths();
    
        req['duration_preffix'] = (duration >= 1) ? 'Month' : '';

        let field_name = 'date_day';
        if (duration >= 1){
            field_name = 'date_month';
        }

        let whereProvider = '';
        if (req.query.providerId){
            whereProvider = ' AND provider_id = \'' + req.query.providerId + '\'';

            req['org_preffix'] = '';
        }else{
            req['org_preffix'] = 'Organization';
        }

        req['where_date'] = field_name + ' >= \'' + req['start_date'] + '\' AND ' + field_name + ' <= \'' + req['end_date'] + '\'' + whereProvider;
    }else if (req['start_date']){
        
        next();
    }else{
        return res.json({message:'ERROR'});
    }


    
    next();
});


router.get('/payments', (req:Request, res:Response) => {


    db.query('SELECT * FROM StatsPayments'+req['duration_preffix']+  req['org_preffix'] +  ' WHERE organization_id=:organization_id AND ' + req['where_date'], {
        replacements:{
            organization_id:req['organization_id']
        },
        type: db.Sequelize.QueryTypes.SELECT
    }).then(response => {
        res.json(formatOutput({start:req['start_date'], end:req['end_date']}, response, req['duration_preffix']));
    });

});

router.get('/proceduresList', (req:Request, res:Response) => {

    req['where_date'] = req['where_date'].replace(/date_month/g, 'date_day');

    db.query('SELECT * FROM StatsProceduresList' + req['org_preffix'] + ' WHERE organization_id=:organization_id AND ' + req['where_date'], {
        replacements:{
            organization_id:req['organization_id']
        },
        type: db.Sequelize.QueryTypes.SELECT
    }).then(response => {
        res.json(response);
    })

});

router.get('/paymentsList', (req:Request, res:Response) => {

    req['where_date'] = req['where_date'].replace(/date_month/g, 'date_day');

    db.query('SELECT * FROM StatsPaymentsList' + req['org_preffix'] + ' WHERE organization_id=:organization_id AND ' + req['where_date'], {
        replacements:{
            organization_id:req['organization_id']
        },
        type: db.Sequelize.QueryTypes.SELECT
    }).then(response => {
        res.json(response);
    })
});

router.get('/appointmentsList', (req:Request, res:Response) => {

    req['where_date'] = req['where_date'].replace(/date_month/g, 'date_day');

    db.query('SELECT * FROM StatsAppointmentsList' + req['org_preffix'] + ' WHERE organization_id=:organization_id AND ' + req['where_date'], {
         replacements:{
            organization_id:req['organization_id']
        },
        type: db.Sequelize.QueryTypes.SELECT
    }).then(response => {
        res.json(response);
    })

})

router.get('/appointments', (req:Request, res:Response) => {



    db.query('SELECT * FROM StatsAppointments'+req['duration_preffix']+ req['org_preffix'] + ' WHERE organization_id=:organization_id AND ' + req['where_date'], {
        replacements:{
            organization_id:req['organization_id']
        },
        type: db.Sequelize.QueryTypes.SELECT
    }).then(response => {
        res.json(formatOutput({start:req['start_date'], end:req['end_date']}, response, req['duration_preffix']));
    });

});



router.get('/initialAppointments', (req:Request, res:Response) => {



    db.query('SELECT * FROM StatsInitialAppointments'+req['duration_preffix']+ req['org_preffix'] + ' WHERE organization_id=:organization_id AND ' + req['where_date'], {
        replacements:{
            organization_id:req['organization_id']
        },
        type: db.Sequelize.QueryTypes.SELECT
    }).then(response => {
        res.json(formatOutput({start:req['start_date'], end:req['end_date']}, response, req['duration_preffix']));
    });

});

router.get('/initialAppointmentsDeleted', (req:Request, res:Response) => {



    db.query('SELECT * FROM StatsInitialAppointmentsDeleted'+req['duration_preffix']+ req['org_preffix'] + ' WHERE organization_id=:organization_id AND ' + req['where_date'], {
        replacements:{
            organization_id:req['organization_id']
        },
        type: db.Sequelize.QueryTypes.SELECT
    }).then(response => {
        res.json(formatOutput({start:req['start_date'], end:req['end_date']}, response, req['duration_preffix']));
    });

});

router.get('/invoices', (req:Request, res:Response) => {

    db.query('SELECT * FROM StatsInvoices'+req['duration_preffix']+ req['org_preffix'] + ' WHERE organization_id=:organization_id AND ' + req['where_date'], {
        replacements:{
            organization_id:req['organization_id']
        },
        type: db.Sequelize.QueryTypes.SELECT
    }).then(response => {
        res.json(formatOutput({start:req['start_date'], end:req['end_date']}, response, req['duration_preffix']));
    });

});

router.get('/paymentTypes', (req:Request, res:Response) => {

    db.query('SELECT * FROM StatsPaymentTypes'+req['duration_preffix']+ req['org_preffix'] + ' WHERE organization_id=:organization_id AND ' + req['where_date'], {
        replacements:{
            organization_id:req['organization_id']
        },
        type: db.Sequelize.QueryTypes.SELECT
    }).then(response => {
        res.json(formatOutput({start:req['start_date'], end:req['end_date']}, response, req['duration_preffix']));
    });

});

router.get('/procedureTypes', (req:Request, res:Response) => {

    db.query('SELECT * FROM StatsProcedureTypes'+req['duration_preffix']+ req['org_preffix'] + ' WHERE organization_id=:organization_id AND ' + req['where_date'], {
        replacements:{
            organization_id:req['organization_id']
        },
        type: db.Sequelize.QueryTypes.SELECT
    }).then(response => {
        res.json(formatOutput({start:req['start_date'], end:req['end_date']}, response, req['duration_preffix']));
    });

});

router.get('/providerWorkhours', (req:Request, res:Response) => {

    db.query('SELECT * FROM StatsProviderWorkhours'+req['duration_preffix']+ req['org_preffix'] + ' WHERE organization_id=:organization_id AND ' + req['where_date'], {
        replacements:{
            organization_id:req['organization_id']
        },
        type: db.Sequelize.QueryTypes.SELECT
    }).then(response => {
        res.json(formatOutput({start:req['start_date'], end:req['end_date']}, response, req['duration_preffix']));
    });

});

router.get('/providerWorkhoursAll', (req:Request, res:Response) => {

    db.query('SELECT * FROM StatsProviderWorkhoursAll'+req['duration_preffix']+ req['org_preffix'] + ' WHERE organization_id=:organization_id AND ' + req['where_date'], {
        replacements:{
            organization_id:req['organization_id']
        },
        type: db.Sequelize.QueryTypes.SELECT
    }).then(response => {
        res.json(formatOutput({start:req['start_date'], end:req['end_date']}, response, req['duration_preffix']));
    });

});

router.get('/patients', (req:Request, res:Response) => {

    db.query('SELECT * FROM StatsPatients'+req['duration_preffix']+ req['org_preffix'] + ' WHERE organization_id=:organization_id AND ' + req['where_date'], {
        replacements:{
            organization_id:req['organization_id']
        },
        type: db.Sequelize.QueryTypes.SELECT
    }).then(response => {
        res.json(formatOutput({start:req['start_date'], end:req['end_date']}, response, req['duration_preffix']));
    });

});

router.get('/patientsReference', (req:Request, res:Response) => {

    db.query('SELECT * FROM StatsPatientsReference'+req['duration_preffix']+ req['org_preffix'] + ' WHERE organization_id=:organization_id AND ' + req['where_date'], {
        replacements:{
            organization_id:req['organization_id']
        },
        type: db.Sequelize.QueryTypes.SELECT
    }).then(response => {
        res.json(formatOutput({start:req['start_date'], end:req['end_date']}, response, req['duration_preffix']));
    });

});

router.get('/patientsAge', (req:Request, res:Response) => {

    db.query('SELECT * FROM StatsPatientsAge'+req['duration_preffix']+ req['org_preffix'] + ' WHERE organization_id=:organization_id AND ' + req['where_date'], {
        replacements:{
            organization_id:req['organization_id']
        },
        type: db.Sequelize.QueryTypes.SELECT
    }).then(response => {
        res.json(formatOutput({start:req['start_date'], end:req['end_date']}, response, req['duration_preffix']));
    });

});



export const analyticsRouter = router;
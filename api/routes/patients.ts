import {Router, Request, Response, RequestHandler} from 'express';
import * as moment from 'moment';

import * as urlencode from 'urlencode';

import {db} from './../models/index';

import {Patient} from './../models/user/patient/main';

import {OrganizationSubscription} from './../models/organization/subscription';

import {User} from './../models/user/main';

import {Appointment} from './../models/appointment/main';

import {PatientAccess} from './../models/user/patient/access';

import {OrganizationLimit} from './../models/organization/limit';

import {LogService} from './../services/logService';

const router = Router();

const pageLimit = 100;

router.post('/', (req, res, next) => {

    Patient.count({
        where : {
            organization_id : req['organization_id']
        }
    }).then(
        patients_count => {

             OrganizationLimit.findById<OrganizationLimit>(req['organization_id']).then(
                organization_limit => {

                    if (patients_count >= organization_limit.patients_count && organization_limit.patients_count != 0){
                        return res.status(400).json({message:'REACH_PATIENTS_LIMIT'});
                    }

                    req.body.email = 'org'+req['organization_id']+'.'+(new Date().getTime()) + '@dentaltap.com';
                    let user = new User(req.body);

                    user.set_password('@dentaltap');

                    user.validate().then( 
                        validated_user => {
                            
                            user.save().then(
                                user_account => {

                                    let patient = new Patient();
                                    patient.create_user_id = req['account_id'];
                                    patient.organization_id = req['organization_id'];
                                    patient.dental_chart = JSON.stringify({});
                                    patient.allergies = JSON.stringify([]);
                                    patient.medications = JSON.stringify([]);
                                    patient.urgent = JSON.stringify([]);
                                    patient.past_ill = JSON.stringify([]);
                                    patient.current_ill = JSON.stringify([]);
                                    patient.custom_fields = JSON.stringify({});

                                    Patient.max('internal_number', {
                                        where:{
                                            organization_id:req['organization_id']
                                        }
                                    }).then(
                                        maxInternalNumber => {
                                            
                                            if (!maxInternalNumber)
                                                maxInternalNumber = 0;

                                            patient.internal_number = maxInternalNumber + 1;

                                            user_account.create_patient(patient).then(
                                                patient => {
                                                    patient.setDataValue('patient_user', user_account);

                                                    new LogService({
                                                        organization_id:req['organization_id'],
                                                        create_user_id:req['account_id'],
                                                        type:'patient_add',
                                                        resource_id:patient.getDataValue('id'),
                                                        patient_id:patient.getDataValue('id'),
                                                        data:JSON.stringify({})
                                                    }).add();
                                                    
                                                    res.json(patient);
                                                }
                                            );
                                        }
                                    )
                                }
                            )
                        }
                    ).catch(
                        err => {
                            res.status(400).json({message:'INVALID_DATA'});
                        }
                    )
                }
            )
        }
    )
});


router.get('/:group/:page/:orderBy/:searchVal?', (req, res, next) => {

    let birthday_desc = 'case when birthday is null then 1 else 0 end, (MONTH(birthday) - MONTH(GETDATE()) + 12) % 12 DESC, DATEADD(year, YEAR(GETDATE()) - YEAR(birthday), birthday) DESC, YEAR(birthday) DESC ';

    let birthday_asc = 'case when birthday is null then 1 else 0 end, (MONTH(birthday) - MONTH(GETDATE()) + 12) % 12 ASC, DATEADD(year, YEAR(GETDATE()) - YEAR(birthday), birthday) ASC, YEAR(birthday) ASC ';

    let startPos = Number(req.params.page) * pageLimit;

    let orderBy = 'patient_user.createdAt DESC';

    let group = 'active';

    let whereGroup = ' [patient].[is_archived] = 0 ';

    let orderTT = 'DESC';
     if (req.params.orderBy){

        orderTT =  req.params.orderBy.split('=')[1].toUpperCase();

        if (orderTT != 'DESC' && orderTT != 'ASC')
            orderTT = 'DESC';

     }
    switch(req.params.group){
        case 'primary' : whereGroup = ' (SELECT COUNT(*) FROM Appointment ap WHERE ap.patient_id =[Patient].[id]) <=1'; break;
        case 'debts':  whereGroup = ' [patient].[total_debts] > 0 '; break;
        case 'archived': whereGroup = ' [patient].[is_archived] = 1 '; break;
        case 'shared': whereGroup = ' [patient].[create_user_id] != \'' + req['account_id'] + '\' ';
    }

   
    if (req.params.orderBy){

        let order = req.params.orderBy.split('=');

        if (order.length  != 2){
            return res.status(400).json({message:'UNABLE_TO_SORT'});
        }

        let orderType = order[1].toUpperCase();

       
        switch(order[0]){
            case 'create_date'  : orderBy = 'patient_user.createdAt '; break;
            case 'fullname'     : orderBy = 'patient_user.fullname '; break;
            case 'total_debts'  : orderBy = (orderType == 'DESC') ? 'patient.total_debts ' : 'patient.balance '; break;
            case 'last_appt'    : orderBy = '[patient_appointments].date '; break;
            default             : orderBy = 'patient_user.createdAt '; break;
        }

        
        if (orderType != 'DESC' && orderType != 'ASC')
            orderType = 'DESC';

        orderBy += orderType;

        if (order[0] == 'birthday'){
            orderBy = (orderType == 'ASC') ? birthday_asc : birthday_desc;
        }

    }
    
    let like = '%';
    
    if (req.params.searchVal){
        let searchVal =  req.params.searchVal.replace("\"","\\\"").replace("\'","\\\'");

        if (urlencode.decode(searchVal).length > 0){
            like = '%' + urlencode.decode(searchVal) + '%';
        }
    }

    let where = {};

    where['organization_id'] = req['organization_id'];
    where['$and'] = [{
        $or:[
            db.Sequelize.literal("[patient_user].[fullname] LIKE N'"+like+"'"),
            db.Sequelize.literal("REPLACE(REPLACE(REPLACE(REPLACE([patient_user].[phone], '+', ''), ')', ''), '(', ''), '-', '') LIKE '" + like + "'")
        ]
    }];
    where['id'] = db.Sequelize.literal(whereGroup);


    if (!req['user_role']['patients'])
        where['$and'].push([{create_user_id:req['account_id']}]);
    
    /*
    if (!req['user_role']['patients'] && req['user_role']['role_id'] != 1)
        where['$and'].push([{
                '$patient_accesses.user_id$': req['account_id'],
                '$patient_accesses.is_edit$': true
            }, {
                create_user_id : req['account_id']
            }
        ]);
    else
        where['$and'].push([{create_user_id:req['account_id']}]);*/

    Patient.findAll<Patient>({
        where:(where as any),
        include: ([{
            model: User
        }, {
            model: PatientAccess
        }, {
            model: Appointment,
            required: false,
            where:{
                id:db.Sequelize.literal('[patient_appointments].[id] = (SELECT TOP 1 a.id FROM Appointment a WHERE a.patient_id = [Patient].[id] ORDER BY a.date DESC) ')
            }
        }] as any),
        order: db.Sequelize.literal(orderBy + ' OFFSET ' + startPos + '  ROWS FETCH NEXT ' + pageLimit + ' ROWS ONLY')
    }).then(
        users => {
            res.json(users);
        }
    )

})


router.get('/patientPhone/:phone', (req, res) => {


    let like = decodeURI(req.params.phone).replace(/\D/g,'');

    Patient.findOne<Patient>({
        include: [{
            model: User
        }],
        where: ({
            $and:[{
                organization_id:req['organization_id']
            },
            db.Sequelize.literal("REPLACE(REPLACE(REPLACE(REPLACE([patient_user].[phone], '+', ''), ')', ''), '(', ''), '-', '') LIKE '%" + like + "%'")
        ]} as any)  
    }).then(
        response => {
            res.json(response);
        }
    )

})



router.get('/stats', (req, res) => {


    Patient.count({
        where:{
            organization_id:req['organization_id']
        }
    }).then(count => {
        OrganizationLimit.findById<OrganizationLimit>(req['organization_id']).then(organization_limit => {
            res.json({created:count, available:organization_limit.getDataValue('patients_count')})
        });
    })

})

export const patientsRouter = router;
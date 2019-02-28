import {Router, Request, Response, RequestHandler} from 'express';
import {db} from './../models/index';

import {Patient} from './../models/user/patient/main';

import {OrganizationTask} from './../models/organization/task';

import {PatientPlan} from './../models/user/patient/plan';

import {PatientProcedure} from './../models/user/patient/procedure';

import {User} from './../models/user/main';

import {UserRole} from './../models/user/user_role';

import {Appointment} from './../models/appointment/main';

import {LogService} from './../services/logService';

const router = Router({mergeParams:true});


router.all('/*', (req, res, next) => {

    PatientPlan.findAll<PatientPlan>({
        where:{
            patient_id:req['patient']['id']
        }
    }).then(
        response => {

            let planIds = '(';
            response.forEach((row, i) => {
                planIds += '\''+row.getDataValue('id')+'\'';

                if (i != response.length - 1){
                    planIds +=',';
                }else{
                    planIds +=')';
                }
            });

            console.log('------------------');
            console.log(planIds);
            req['patient_plan'] = response;

            if (response.length > 0)
            db.query('SELECT * FROM StatsPlanPrice WHERE plan_id IN ' + planIds , {
                type: db.Sequelize.QueryTypes.SELECT
            }).then(
                plans => {

                    response.forEach((row) => {
                        plans.forEach((planSum) => {

                            if (planSum['plan_id'] == row.getDataValue('id')){
                                row.setDataValue('procedures_sum', planSum['plan_sum']);
                                row.updateAttributes({
                                    procedures_sum: planSum['plan_sum']
                                });
                            }
                                
                        })
                    })
                }
            );
            
            next();
        }
    );

})

router.get('/', (req:Request, res:Response) => {


    res.json(req['patient_plan']);
})

router.post('/', (req:Request, res:Response) => {

    let plan:any = {
        patient_id:req['patient']['id'],
        name:req.body.name,
        status:0,
        dental_chart:JSON.stringify({}),
        procedures_sum:0
    };

    PatientPlan.create<PatientPlan>(plan).then(
        response => {
            res.json(response);
        },
        errors => {
            res.status(400).json({message:'INVALID_PLAN_DATA'});
        }
    )

});

router.delete('/:tpId', (req:Request, res:Response) => {

    
    PatientPlan.findOne<PatientPlan>({
        where:{
            id:req.params.tpId,
            patient_id:req['patient']['id']
        }
    }).then(response => {
        
        let planId = response.getDataValue('id');

        new LogService({
            organization_id:req['organization_id'],
            type:'treatment_procedure_add',
            resource_id:planId
        }).destroy();

         new LogService({
            organization_id:req['organization_id'],
            type:'plan_add',
            resource_id:planId
        }).destroy();

        response.destroy();

        
        res.json({message:'Ok'});
        
    })


})

router.get('/:tpId', (req:Request, res:Response) => {

    PatientProcedure.findAll<PatientProcedure>({
        where:{
            plan_id:req.params.tpId,
            patient_id:req['patient']['id']
        }
    }).then(response => {
        res.json(response);
    })

});

router.put('/:tpId', (req:Request, res:Response) => {

    PatientPlan.findById(req.params.tpId, {
        where:{
            patient_id:req['patient']['id']
        }
    }).then(
        plan => {
            if (!plan)
                res.status(400).json({message:'INVALID_PLAN_DATA'});
            
            let ids = [];

            req.body['procedures'].forEach((appt) => {
                appt['appointment_procedures'].forEach((procedure) => {
                    ids.push(procedure['id']);
                })
            })

            PatientProcedure.findAll({
                where:{
                    plan_id:req.body['id']
                }
            }).then(
                response => {

                    let toDelete = [];

                    let procedures_sum = 0;

                    let total_procedures = response.length;
                    let completed_procedures = 0;

                    response.forEach((procedure) => {
                        procedures_sum += procedure.getDataValue('qty') * procedure.getDataValue('price_fee_adj');
                        if (procedure.getDataValue('id')){
                            if (procedure.getDataValue('status_code') == 'c')
                                completed_procedures += 1;
                            if (ids.indexOf(procedure.getDataValue('id')) == -1){
                                toDelete.push(procedure.getDataValue('id'));
                            }
                        }
                    });

                    plan.updateAttributes({
                        dental_chart:(req.body['dental_chart'] instanceof String )? req.body['dental_chart'] : JSON.stringify(req.body.dental_chart),
                        name:req.body.name,
                        status:req.body.status,
                        total_procedures:total_procedures,
                        completed_procedures:completed_procedures,
                        procedures_sum:procedures_sum
                    });

                    res.json({message:'Ok'});


                }
            )

            
        }
    )


})


export const patientPlan = router;


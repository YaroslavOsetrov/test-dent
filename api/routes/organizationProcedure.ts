import {Router, Request, Response, RequestHandler} from 'express';
import * as fs from 'fs';
import * as _jsonValidator from 'jsonschema';

import {db} from './../models';
import {User} from './../models/user/main';

import {OrganizationProcedure} from './../models/organization/procedure';
import {OrganizationProcedureInventory} from './../models/organization/procedure_inventory';

import {OrganizationInventory} from './../models/organization/inventory';

const router = Router({mergeParams:true});


router.get('/', (req, res, next) => {

     OrganizationProcedure.findAll({
         where:{
             organization_id:req['organization_id']
         },
         include:[{
             model:OrganizationProcedureInventory,
             required:false
         }]
     }).then(
        procedures => {
            res.json(procedures);
        }
    ).catch(
        err => {

        }
    )
})

router.delete('/:procedureId/inventory/:inventoryId', (req, res) => {

    OrganizationProcedure.findOne({
        where:{
            id:req.params['procedureId'],
            organization_id:req['organization_id']
        }
    }).then(
        procedure => {
            if (!procedure)
                return res.status(400).json({message:'BAD_REQUEST'});
            
            OrganizationProcedureInventory.destroy({
                where:{
                    procedure_id:req.params['procedureId'],
                    inventory_id:req.params['inventoryId'],
                }
            }).then(
                response => {

                }
            )
        }
    )
    res.json({message:'Ok'});
})

router.post('/:procedureId/inventory', (req, res) => {

    OrganizationProcedure.findOne({
        where:{
            id:req.params['procedureId'],
            organization_id:req['organization_id']
        }
    }).then(
        procedure => {
            if (!procedure)
                return res.status(400).json({message:'BAD_REQUEST'});

            OrganizationProcedureInventory.destroy({
                where:{
                    procedure_id:req.params['procedureId']
                }
            }).then(
                response => {
                    
                    req.body.forEach((row) => {
                        row['procedure_id'] = req.params['procedureId'];
                    })
                    
                    OrganizationProcedureInventory.bulkCreate<OrganizationProcedureInventory>(req.body).then(
                        response => {
                            res.json(response);
                        }
                    )

                }
            )
        }
    )

    

})

router.delete('/', (req, res) => {

    let ids = [];

    try{
        req.body.forEach(id => {
            ids.push(id);
        })
    }catch(e){
        res.status(400).json({message:'BAD_REQUEST'});
    }

    OrganizationProcedure.destroy({
        where:{
            id:ids,
            organization_id:req['organization_id']
        }
    }).then(
        response => {
            res.json({message:'Ok'});
        }
    ).catch(e => {
        res.status(400).json({message:'BAD_REQUEST'});
    })

})

router.post('/', (req, res) => {

    let toInsert = [];
    let toUpdate =[];

    try{
        req.body.forEach((row) => {
            row['organization_id']= req['organization_id'];
            if (!row['id'])
                toInsert.push(row);
            else if (row['is_edit'])
                toUpdate.push(row);
        })
    }catch(e){
        res.status(400).json({message:'BAD_REQUEST'});
    }

    if (toInsert.length > 0)
        OrganizationProcedure.bulkCreate<OrganizationProcedure>(toInsert).then(
            response => {
                response.forEach((row) => {
                    row.setDataValue('procedure_inventory', []);
                })
                res.json(response);
            }
        )
    else
        res.json([]);
    
    if (toUpdate.length > 0)
        db.Sequelize.Promise.each(toUpdate, (row, index) => {
            return OrganizationProcedure.update({
                name: row['name'],
                code: row['code'],
                fee: row['fee']
            },{
                where:{
                    id: row['id'],
                    organization_id:req['organization_id']
                }
            }).then((user) => {
            }, (err) => {

            });
        })
        .then((updateAll) => {
            }, (err) => {
        });
});

export const organizationProcedureRouter = router;

            


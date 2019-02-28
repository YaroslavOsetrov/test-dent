import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';
import {db} from './../models';

import * as urlencode from 'urlencode';


import {OrganizationProcedureInventory} from './../models/organization/procedure_inventory';
import {OrganizationInventory} from './../models/organization/inventory';
import {OrganizationInventoryOffice} from './../models/organization/inventory_office';
import {OrganizationInventoryTransaction} from './../models/organization/inventory_transaction';

const models = db.models;
const router = Router({mergeParams:true});


router.get('/', (req, res) => {

    let whereCond = {
        is_deleted:false,
        organization_id:req['organization_id']
    }

    if (req.query['ids']){
        try{
            whereCond['id'] =JSON.parse(urlencode.decode(req.query['ids']));
        }catch (e){
            return res.status(400).json({message:'BAD_REQUEST'});
        }
        
    }

    OrganizationInventory.findAll<OrganizationInventory>({
        where:whereCond,
        include:[OrganizationInventoryOffice]
    }).then(
        response => {
            res.json(response);
        }
    ).catch(e => {
        res.status(400).json({message:'BAD_REQUEST'});
    })
})


router.get('/search/:value', (req, res) => {

    let where = {
        is_deleted:false
    };

    where['$or'] = [{
        code:{
            $like: '%' + req.params['value'] + '%'
        }
    }, {
        name:{
            $like: '%' + req.params['value'] + '%'
        }
    }]

    OrganizationInventory.findAll<OrganizationInventory>({
        where:where,
        include:[OrganizationInventoryOffice]
    }).then(
        response => {
            res.json(response);
        }
    )

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
        OrganizationInventory.bulkCreate<OrganizationInventory>(toInsert).then(
            response => {
                res.json(response);
            }
        )
    
    if (toUpdate.length > 0)
        db.Sequelize.Promise.each(toUpdate, (row, index) => {
            return OrganizationInventory.update({
                name: row['name'],
                code: row['code'],
                count_one: row['count_one'],
                unit: row['unit'],
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
                if (toInsert.length == 0)
                    res.json({message:'Ok'});
            }, (err) => {
        });
});

router.post('/transaction', (req, res) => {


    req.body['create_user_id'] = req['account_id'];

    OrganizationInventory.findOne<OrganizationInventory>({
        where:{
            organization_id:req['organization_id'],
            id:req.body.inventory_id
        }
    }).then(
        inventory => {
            if (inventory){

                OrganizationInventoryOffice.findOne({
                    where:{
                        inventory_id:req.body.inventory_id,
                        office_id:req.body.office_id
                    }
                }).then(
                    inventory_office => {
                        if (inventory_office)
                            inventory_office.updateAttributes({
                                count:inventory_office.getDataValue('count') + req.body.count
                            })
                        else
                            OrganizationInventoryOffice.create<OrganizationInventoryOffice>({
                                inventory_id:req.body.inventory_id,
                                office_id:req.body.office_id,
                                count:req.body.count
                            })
                    }
                );

                OrganizationInventoryTransaction.create(req.body).then(
                    response => {
                        res.json(response);
                    }
                )
            }
            
        }
    );

})

router.put('/', (req, res) => {

    

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

    OrganizationProcedureInventory.destroy({
        where:{
            inventory_id:ids,
            organization_id:req['organization_id'],
        }
    });

    OrganizationInventory.update({
        is_deleted:true
    },{
        where:{
            organization_id:req['organization_id'],
            id:ids
        }
    })
    res.json({message:'Ok'});
})


export const organizationInventoryRouter = router;
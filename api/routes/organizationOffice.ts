import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';
import {db} from './../models';

import {OrganizationOffice, OrganizationOfficeRoom} from './../models/organization/office';

const models = db.models;
const router = Router({mergeParams:true});

const pageLimit = 10;

router.get('/', (req, res) => {

    OrganizationOffice.findAll({
        where:{
            organization_id:req['organization_id'],
            is_deleted:false
        },
        include:[{
            model:OrganizationOfficeRoom,
            where:{
                is_deleted:false
            },
            required:false
        }],
        order:[['createdAt', 'ASC']]
    }).then(
        response => {

            if (response.length == 0){
                OrganizationOffice.create({
                    organization_id:req['organization_id'],
                    name:'Main office',
                    is_deleted:false
                }).then(
                    response => {
                        let arr = [];
                        OrganizationOfficeRoom.create({
                            office_id:response.getDataValue('id'),
                            name:'Room #1',
                            is_deleted:false
                        }).then(
                            responseRoom => {
                                let rooms = [];
                                responseRoom.setDataValue('id', responseRoom.getDataValue('id').toUpperCase())
                                rooms.push(responseRoom);
                                response.setDataValue('rooms', rooms);
                                arr.push(response);
                                res.json(arr);
                            }
                        );
                    }
                )
            }else
                res.json(response);
        }
    )

})

router.get('/:officeId', (req, res, next) => {

    OrganizationOffice.findOne({
        where:{
            organization_id:req['organization_id'],
            is_deleted:false
        }
    }).then(
        response => {
            req['office'] = response;
            next();
        }
    )

})

router.post('/', (req, res) => {
    OrganizationOffice.create<OrganizationOffice>({
        organization_id:req['organization_id'],
        is_deleted:false,
        name:req.body['name']
    }).then(
        office => {

            OrganizationOfficeRoom.create({
                name:'Room #1',
                office_id:office.getDataValue('id')
            }).then(
                room => {
                    let rooms = [];
                    rooms.push(room);
                    office.setDataValue('rooms', rooms);
                    res.json(office);
                }
            )
            
        }
    )
})

router.put('/', (req, res) => {
    OrganizationOffice.findOne<OrganizationOffice>({
        where:{
            organization_id:req['organization_id'],
            id:req.body['id']
        }
    }).then(
        office => {
            if (!office)
                return res.status(400).json({message:'BAD_REQUEST'});

            office.updateAttributes({
                name:req.body['name']
            })

            res.json({message:'OK'});
        }
    )
})

router.delete('/:officeId', (req, res) => {

    OrganizationOffice.findOne({
        where:{
            organization_id:req['organization_id'],
            id:req.params['officeId']
        }
    }).then(
        office => {
            office.updateAttributes({
                is_deleted:true
            })
            
            res.json({message:'Ok'});
        }
    )
})

router.post('/:officeId/rooms', (req, res) => {

    try{
        req.body.forEach((row) => {
            row['office_id']= req.params['officeId'];
            row['is_deleted'] = false;
        })
    }catch(e){
        res.status(400).json({message:'BAD_REQUEST'});
    }
    

    OrganizationOfficeRoom.bulkCreate<OrganizationOfficeRoom>(req.body).then(
        response => {

            response.forEach((row) => {
                row.setDataValue('id', row.getDataValue('id').toUpperCase());
            })

            res.json(response);
        }
    )
})

router.delete('/:officeId/rooms', (req, res) => {

    let ids = [];
    try{
        req.body.forEach((row) => {
            ids.push(row['id']);
        })
    }catch (e){
        res.status(400).json({message:'BAD_REQUEST'});
    }
    
    OrganizationOfficeRoom.destroy({
        where:{
            office_id:req.params['officeId'],
            id:ids
        }
    })

    res.json({message:'Ok'});
})


export const organizationOffice = router;
import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';

import * as fs from 'fs';

import * as formidable from 'formidable';

import * as randomstring from 'randomstring';

import {db} from './../models';

import {AWSService} from './../services/awsService';

import {OrganizationLimit} from './../models/organization/limit';

import {PatientFile} from './../models/user/patient/file';

import {ConfigService} from './../services/configService';

const models = db.models;
const router = Router({mergeParams:true});

const config = new ConfigService();

const env = process.env.APP_ENV || 'development';
const maxMbSize = 500;

router.get('/', (req:Request, res:Response) => {

    PatientFile.findAll({
        where:{
            patient_id:req['patient']['id']
        },
        order:[['createdAt', 'DESC']]
    }).then(
        response =>{
            res.json(response);
        }
    )
})

router.post('/', (req:Request, res:Response) => {
/*
    let settings = config.getConfig('azure_storage')[env];
    let blobService = azure.createBlobService('usedevelopmentstorage=true');



    console.log(blobService);
    let container = 'files';
    let form = new formidable.IncomingForm();

    form.uploadDir = require('app-root-dir').get()+'/public/tmp';
    form.keepExtensions = true;


    form.parse(req, function(err:any, fields:any, files:any) {
        if (Object.keys(files).length === 0 && files.constructor === Object){
            return res.status(400).json({message:'FILE_NOT_FOUND'});
        }

        for (var file_key in files){
            if (files.hasOwnProperty(file_key)){
                
                let file = files[file_key];
                let mbSize = Math.round(file.size / 1024 / 1024 * 100) / 100;

                if (mbSize > maxMbSize){
                    return res.status(400).json({message:'BIG_FILE_SIZE'});
                }

                OrganizationLimit.findByPrimary(req['organization_id']).then(limits => {
                    if (limits.getDataValue('storage_size_free') >= mbSize){
                        limits.updateAttributes({
                            storage_size_free: limits.getDataValue('storage_size_free') - mbSize
                        });

                        let extension = file.name.split('.').pop().toLocaleLowerCase();

                        let blobName = req['patient']['id'] + '-' + randomstring.generate(10).toUpperCase() + '.' + extension;

                        let uploadedName = file.path.split("\\").pop();

                        blobService.createBlockBlobFromLocalFile('files', blobName, require('app-root-dir').get()+'/public/tmp/'+uploadedName, (error:any, filename:any, response:any) => {

                            PatientFile.create({
                                name:file.name,
                                url:blobName,
                                extension:extension,
                                size:mbSize,
                                patient_id:req['patient']['id'],
                                tags:'',
                                organization_id:req['organization_id'],
                                create_user_id:req['account_id']
                            }).then(file => {
                                res.json(file);
                            })
                        });
                        
                    }
                });
            }
        }

    });*/

    let aws = new AWSService('DentalTap');

    let form = new formidable.IncomingForm();

    form.uploadDir = require('app-root-dir').get()+'/public/tmp';
    form.keepExtensions = true;

    form.parse(req, function(err:any, fields:any, files:any) {

        if (Object.keys(files).length === 0 && files.constructor === Object){
            return res.status(400).json({message:'FILE_NOT_FOUND'});
        }

        for (var file_key in files){
            if (files.hasOwnProperty(file_key)){
                
                let file = files[file_key];
                let mbSize = Math.round(file.size / 1024 / 1024 * 100) / 100;

                if (mbSize > maxMbSize){
                    return res.status(400).json({message:'BIG_FILE_SIZE'});
                }

                OrganizationLimit.findByPrimary(req['organization_id']).then(limits => {
                    if (limits.getDataValue('storage_size_free') < mbSize){
                        return res.status(400).json({message:'EXCEEDED_UPLOAD_LIMIT'});
                    }
                    
                    limits.updateAttributes({
                        storage_size_free: limits.getDataValue('storage_size_free') - mbSize
                    });

                    let extension = file.name.split('.').pop().toLocaleLowerCase();

                    let uploadedName = file.path.split("\\").pop();

                    let filePath = require('app-root-dir').get()+'/public/tmp/'+uploadedName;   

                    fs.readFile(filePath, (err, data) => {

                        PatientFile.create({
                            name:file.name,
                            url:uploadedName,
                            extension:extension,
                            size:mbSize,
                            patient_id:req['patient'].getDataValue('id'),
                            tags:'',
                            organization_id:req['organization_id'],
                            create_user_id:req['account_id']
                        }).then(file => {
                            aws.upload(uploadedName, data, null, res,file);
                        })

                    });
                });

            }
        }
    });

});


router.delete('/', (req:Request, res:Response) => {

    PatientFile.findOne({
        where:({
            patient_id:req['patient']['id'],
            id:{in:req.body}
        } as any)
    }).then(
        file => {

            OrganizationLimit.findByPrimary(req['organization_id']).then(limits => {
                limits.updateAttributes({
                    storage_size_free: limits.getDataValue('storage_size_free') + file.getDataValue('size')
                });
            });
            file.destroy();

            res.json({message:"Ok"});
        }
    )

})

export const patientFile = router;
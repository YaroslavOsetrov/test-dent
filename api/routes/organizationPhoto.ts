import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';

import * as fs from 'fs';

import * as jimp from 'jimp';

import * as formidable from 'formidable';

import * as randomstring from 'randomstring';

import {db} from './../models';

import {OrganizationLimit} from './../models/organization/limit';

import {AWSService} from './../services/awsService';

import {ConfigService} from './../services/configService';

const models = db.models;
const router = Router({mergeParams:true});

const env = process.env.APP_ENV || 'development';
const maxMbSize = 2;

router.post('/', (req:Request, res:Response) => {

    let aws = new AWSService('DentalTap');

    let form = new formidable.IncomingForm();

    form.uploadDir = require('app-root-dir').get()+'/public/tmp';
    form.keepExtensions = true;

    form.parse(req, (err:any, fields:any, files:any) => {

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
/*
                let blobName = req['organization']['id'] + '-' + randomstring.generate(10).toUpperCase() + '.jpg';

                let uploadedName = file.path.split("\\").pop();


                let filePath = require('app-root-dir').get()+'/public/tmp/'+uploadedName;
*/
                let extension = file.name.split('.').pop().toLocaleLowerCase();

                let uploadedName = file.path.split("\\").pop();

                let filePath = require('app-root-dir').get()+'/public/tmp/'+uploadedName;   

                filePath = filePath.replace('/var/app/current/public/tmp//', '/');

                console.log('-------------------------------------------------------------');
                console.log(filePath);

                req['organization'].updateAttributes({
                    photo:uploadedName.replace('/var/app/current/public/tmp/', '')
                })

                fs.readFile(filePath, (err, data) => {   

                    jimp.read(filePath).then((image:any) => {

                        image.resize(200, 200).background( 0xFFFFFFFF ).write(filePath, (data:any) => {

                          

                            fs.readFile(filePath, (err, data) => {

                                aws.upload(uploadedName.replace('/var/app/current/public/tmp/', ''), data, 'image/jpeg', res);

                                

                             //   fs.unlink(filePath, () => {});

                            });
                        });
                    });
                });
            }
        }
    });
})
/*
router.post('/', (req:Request, res:Response) => {



    let config = new ConfigService();
    let settings = config.getConfig('azure_storage')[env];

    let credentials = settings;
    
    if (env !== 'production'){
        credentials = 'usedevelopmentstorage=true';
    }

    let blobService = azure.createBlobService(credentials);

    let container = 'files';
    let form = new formidable.IncomingForm();

    form.uploadDir = require('app-root-dir').get()+'/public/tmp';
    form.keepExtensions = true;


    form.parse(req, function(err:any, fields:any, files:any) {

        console.log('sadfasdf');

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

                let blobName = req['account']['id'] + '-' + randomstring.generate(10).toUpperCase() + '.jpg';

                let uploadedName = file.path.split("\\").pop();

                let filePath = require('app-root-dir').get()+'/public/tmp/'+uploadedName;   

                jimp.read(filePath).then(function (image:any) {

                     image.resize(200, 200).background( 0xFFFFFFFF ).write(filePath, (data:any) => {

                        blobService.createBlockBlobFromLocalFile('files', blobName, filePath, (error:any, filename:any, response:any) => {

                            if(!error){
                                fs.unlinkSync(filePath);

                                req['account'].updateAttributes({
                                    photo: blobName
                                });
                                res.json({photo:blobName});
                            }else{
                                console.log(error);
                            }
                        });

                     })
                }).catch((err:any) => {
                    res.status(400);
                    return res.json({message: 'BAD_IMAGE_SOURCE'});
                });

            }
        }
    });
});
                

/*
                var name = req.Account.Id + '-' + randomstring.generate(10).toUpperCase() +'.jpg';

                jimp.read(files.file.path).then(function (image) {

                    image.resize(200, 200).background( 0xFFFFFFFF ).write(require('app-root-dir').get()+'/public/images/temp/'+name, function(data){

                        blobService.createBlockBlobFromLocalFile(container, name, require('app-root-dir').get()+'/public/images/temp/'+name, function(error, filename, response){

                            if(!error){
                                fs.unlinkSync(require('app-root-dir').get()+'/public/images/temp/'+ name);

                                req.Account.updateAttributes({
                                    Photo: filename
                                });
                                res.json({FileName:filename});
                            }

                        });

                    });

                }).catch(function (err) {
                    res.status(400);
                    return res.json({message: 'Could not upload an image.'});
                });/*
            }
        }

    });

})*/

export const organizationPhotoRouter = router;
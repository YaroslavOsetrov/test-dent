import {Router, Request, Response, RequestHandler} from 'express';
import * as fs from 'fs';
import * as _jsonValidator from 'jsonschema';

import {db} from './../models';
import {User} from './../models/user/main';

import {OrganizationPrice} from './../models/organization/price';

const JsonValidator = _jsonValidator.Validator;

const models = db.models;
const router = Router();

const priceByteMaxSize = 10000000;

router.all('/', (req, res, next) => {

     OrganizationPrice.findById(req['organization_id']).then(
        organizationPrice => {
            req['organization_price'] = organizationPrice;
            next();
        }
    ).catch(
        err => {

        }
    )

})

router.get('/', (req, res, next) => {

    res.json(JSON.parse(req['organization_price'].getDataValue('price_list')));
    
});

router.put('/', (req:Request, res:Response) => {

    let validator = new JsonValidator();

    fs.readFile(require('app-root-dir').get() + '/public/i18n/price_default/scheme.json', 'utf8', (err, data) => {

        let priceSchema = JSON.parse(data);
        

        if (!validator.validate(req.body, priceSchema).valid){
            return res.status(400).json({message: 'INVALID_PRICE_SCHEME'});
        }

        if (Buffer.byteLength(JSON.stringify(req.body), 'utf8') > priceByteMaxSize){
            return res.status(400).json({message: 'EXCEEDED_PRICE_SIZE'});
        }

        req['organization_price'].updateAttributes({
            price_list : JSON.stringify(req.body)
        });

        res.json({message:'OK'});

    });

});


export const priceRouter = router;

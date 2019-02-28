import * as fs from 'fs';

import {jwt_salt} from './../config'

import * as email from 'emailjs';

const env = process.env.APP_ENV || 'development';

import * as jwt from 'jsonwebtoken';


export function JWTverify(token:string){
    return jwt.verify(token, jwt_salt);
}

export class JWTService{


    private token:string;

    constructor(data:any, expire_in_days:number){

        this.token = jwt.sign(data, jwt_salt, {
            expiresIn: expire_in_days+' days'
        });
    }

    get_token(){
        return this.token;
    }

}


import * as fs from 'fs';

const rootDir = require('app-root-dir').get();

class CountryFormat{
    currency_code:string;
    currency_symbol:string;
    is_currency_preffix:boolean;
    phone_code:number;
    to_usd_rate:number;
    locale_format:{
        first_day_index:number;
        date_short:string;
        date_month:string;
        date_short2:string;
        date_full:string;
        date_full2:string;
        date_input:string;
        date_input_mask_mom:string;
        time_mom:string;
        date_input_mask:string;
        date_input_mask_ph:string;
        cal_col:string;
        is_24h:boolean;
    }
}

export class i18nService{

    constructor(){

    }

    country(country_code:string){
        return {};
    }

    countries() {
        return [];
    }

    getFile(file_path:string, lang:string){

        try{
            let data = fs.readFileSync(rootDir + '/public/i18n/' + file_path + '/'+lang+'.json', 'utf8');

            return JSON.parse(data);
        } catch(e) {
            try {
               let data = fs.readFileSync(rootDir + '/public/i18n/' + file_path + '/en.json', 'utf8');

                return JSON.parse(data); 
            }catch(e){
                return {};
            }
        }
    }

    priceList(lang:string):any{
        
        fs.readFile(require('app-root-dir').get() + '/public/i18n/price_default/'+lang+'.json', 'utf8', (err, data) => {
            
            if (err)
                return {};
            else
                return JSON.parse(data)     
        });
    }

    organization_documents(lang:string, documentName:string):any{

        try{
            let data = fs.readFileSync(require('app-root-dir').get() + '/public/i18n/organization_documents/'+lang+'/'+documentName+'.txt', 'utf8');
            return data;
        }catch(e){
            return fs.readFileSync(require('app-root-dir').get() + '/public/i18n/organization_documents/en/'+documentName+'.txt', 'utf8');
        }
    }

    notifications(lang:string):any{

        fs.readFile(require('app-root-dir').get() + '/public/i18n/organization_notifications/'+lang+'.json', 'utf8', (err, data) => {
            
            if (err)
                return {};
            else
                return JSON.parse(data)     
        });
    }

    rich_notes(lang:string):any{

        fs.readFile(require('app-root-dir').get() + '/public/i18n/rich_notes/'+lang+'.json', 'utf8', (err, data) => {
            
            if (err)
                return {};
            else
                return JSON.parse(data)     
        });

    }

    cabinets(lang:string):any{

         fs.readFile(require('app-root-dir').get() + '/public/i18n/cabinets_default/'+lang+'.json', 'utf8', (err, data) => {
            
            if (err)
                return {};
            else
                return JSON.parse(data)     
        });

    }

}
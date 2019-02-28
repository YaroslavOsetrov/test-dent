import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import {ConfigModel, CurrencyModel, LocaleFormatModel, CountryModel} from './model';

import {environment} from './../../../../environments/environment';

import {UserModel} from '@common/models/user/main';

import * as countries from './../../../../../public/json/countries.json';
import * as currencies from '@common/json/currencies.json';

import {isPlatformBrowser} from '@angular/common';

export const API_PREFFIX = '/api/v1';

@Injectable()
export class ConfigService{

    private _defaults:ConfigModel;

    private _users:Array<UserModel>;

    private defaultParams = ['APP_USERS', 'APP_SCHEDULER', 'APP_PROCEDURES', 'APP_CUSTOM_FIELDS', 'APP_RICHNOTES'];

    localStorage:any;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object){

        if (isPlatformBrowser(this.platformId)) {
            this.localStorage = localStorage;
         }else{
             this.localStorage = {
                 getItem(){
                     return null;
                 },
                 setItem(){
                     return null;
                 }
             }
         }
        }

    getProperty(name){
        return this._readProperty(name);
    }
    setProperty(name, value){
        this._setProperty(name, value);
    }

    setProperties(props:Object){
        for (let key in props){
            this._setProperty(key, props[key]);
        }
    }

    get defaults():ConfigModel{
        
        return this._readProperty('APP_CONFIG');
    }

    get defaultCurrency():CurrencyModel{

        let defaults = this.defaults;

        return currencies[defaults.currency_code.toLowerCase()];
    }

    get scheduler(){
        return this._readProperty('APP_SCHEDULER');
    }
    set scheduler(value){
        this._setProperty('APP_SCHEDULER', value);
    }

    get priceList(){
        return this._readProperty('APP_PRICELIST');
    }

    set priceList(value){
        this._setProperty('APP_PRICELIST', value);
    }

    get procedures(){
        return this._readProperty('APP_PROCEDURES');
    }
    set procedures(value){
        this._setProperty('APP_PROCEDURES', value);
    }

    get richNotes(){
        return this._readProperty('APP_RICHNOTES');
    }

    set richNotes(value){
        this._setProperty('APP_RICHNOTES', value);
    }

    get country():CountryModel{

        let parsed =  this._readProperty('APP_CONFIG');

        if (!parsed) return countries['us'];

        if (!countries.hasOwnProperty(parsed.country_code)){
            return countries['us'];
        }

        return countries[parsed.country_code];
        
    }

    isDefaultParamsLoaded(){
        let isLoaded = true;
        this.defaultParams.forEach((param) => {
             if (!this._readProperty(param))
                isLoaded = false;
        })
        return isLoaded;
    }

    set firstLogin(value:boolean){

        if (value == true){
            this._setProperty('APP_FIRSTLOGIN', {login:true});
        }else{
            this._setProperty('APP_FIRSTLOGIN', null);
        }

    }

    get isFirstLogin():boolean{
        return (this._readProperty('APP_FIRSTLOGIN')) ? true : false;
    }

    get tutorialsShown(){
        let shown = this._readProperty('APP_TUTORIALSSHOWN');
        return (shown) ? shown : {};
    }

    addShownTutorial(key:string){
        let shown = this._readProperty('APP_TUTORIALSSHOWN');

        if (!shown)
            shown = {};

        if (!shown[key])
            shown[key] = true;
        
        this._setProperty('APP_TUTORIALSSHOWN', shown);
    }

    get account():UserModel{
        let parsedUsers =  this._readProperty('APP_USERS');

        if (parsedUsers){

            let user = Object.assign({}, parsedUsers[0]);
            if (user['user_roles']){
                user['role'] = user['user_roles'][0];
            }
            return user;
        }
        return null;
    }

    set account(newAcc:UserModel){

        let users = this._readProperty('APP_USERS');

        users[0].language = newAcc.language;
        users[0].is_uni_teeth_scheme = newAcc.is_uni_teeth_scheme;

        this._setProperty('APP_USERS', users);        
    }

    get usersObj():Object{
        let users = this._readProperty('APP_USERS');

        let obj = {};
        users.forEach((row) => {
            obj[row['id']] = row;
        })
        return obj;
    }

    get users():Array<UserModel>{
        return  this._readProperty('APP_USERS');
    }

    set users(value){
        this._setProperty('APP_USERS', value);
    }


    get custom_fields(){
        
        return this._readProperty('APP_CUSTOM_FIELDS');
    }

    set custom_fields(value){
        this._setProperty('APP_CUSTOM_FIELDS', value);
    }

    init(config:ConfigModel){

        this.localStorage.setItem('APP_CONFIG', JSON.stringify(config));

        this._defaults = config;
    }

    private _setProperty(property, value){

        if (value)
            this.localStorage.setItem(property, JSON.stringify(value));
        else
            this.localStorage.setItem(property, null);
    }

    private _readProperty(property){


        let item = JSON.parse(this.localStorage.getItem(property));
        return item;
            
    }

}
import {Component, OnInit, Output, EventEmitter} from '@angular/core';


import {Router} from '@angular/router';
import {BootService, BootInitService} from './service';

import {ConfigService} from './../common/services/config';
import {AuthorizationService} from './../common/services/authorization';

import {TranslateService} from '@ngx-translate/core';


import {Observable, forkJoin} from 'rxjs';

import * as moment from 'moment';
import * as dateLocale from './../../../public/i18n/date.json';

@Component({
    selector: 'boot',
    templateUrl:'component.html'
})
export class BootComponent implements OnInit {

    @Output('bootCompleted') bootCompleted = new EventEmitter<any>();

    @Output('bootLoading') bootLoading = new EventEmitter<any>();

    constructor(private _bootService:BootService, 
                private _router:Router,
                private _translateService:TranslateService, 
                private _authService:AuthorizationService,
                private _bootInitService:BootInitService,
                private _configService:ConfigService){

        
        for (let key in dateLocale){
            moment.defineLocale(key, {
                months  : dateLocale[key]['months_names'],
                monthsShort : dateLocale[key]['months_names_short'],
                weekdays : dateLocale[key]['day_names'],
                weekdaysShort : dateLocale[key]['day_names_short'],
                weekdaysMin  : dateLocale[key]['day_names_min'],
                week:{
                    dow:(this._configService.getProperty('APP_SCHEDULER')) ? this._configService.getProperty('APP_SCHEDULER').first_day_index : 1,
                    doy:new Date(new Date().getFullYear(), 0, 1).getDay()
                }
            });
        } 

        this._applySettings();

    }

    ngOnInit(){

        if (!this._configService.isDefaultParamsLoaded())
            forkJoin(
                this._bootService.getUsers(),
                this._bootService.getSchedulerSections(),
                this._bootService.getPatientFields(),
                this._bootService.getRichNoteTemplates(),
                this._bootService.getOffices(),
                this._bootService.getProcedures()
            ).subscribe(
                response => {
                    this._afterFirstInit(response);
                },
                errors => {
                    
                    if (this._authService.isAuth()){
                        this._authService.logout();
                        location.assign('/login');
                    }
                }
            );
        else {
            this._bootService.setBootCompleted(true);

             if (this._authService.isAuth())
                this._bootService.initCheck().subscribe(
                    response => {

                        mixpanel.people.set({ "$name": this._configService.account['fullname'], "$email": this._configService.account['email'] });
                        mixpanel.identify(this._configService.account['id']);

                        this._bootService.setBootCompleted(true);
                    }, errors => {
                        this._authService.logout();
                        location.assign('/login');
                    }
                )
            else
                this._bootService.setBootCompleted(true);        
         
        }
    }

    firstInit(token){

        this.bootLoading.emit(true);

        this._bootInitService.setToken(token);
    
        forkJoin(
            this._bootInitService.getRequest('/api/v1/organization/collaboration/users'),
            this._bootInitService.getRequest('/api/v1/organization/scheduler'),
            this._bootInitService.getRequest('/api/v1/organization/customFields'),
            this._bootInitService.getRequest('/api/v1/organization/richNoteTemplates'),
            this._bootInitService.getRequest('/api/v1/organization/offices'),
            this._bootInitService.getRequest('/api/v1/organization/procedures')
        ).subscribe(
            response => {
                this._afterFirstInit(response);
            }
        );
        
    }

    afterRegistered(){
        this._configService.firstLogin = true;
    }

     private _afterFirstInit(response){

        this._configService.setProperties({
            'APP_USERS':response[0],
            'APP_SCHEDULER':response[1],
            'APP_CUSTOM_FIELDS':response[2],
            'APP_RICHNOTES':response[3],
            'APP_OFFICES':response[4],
            'APP_PROCEDURES':response[5],
        });

        mixpanel.people.set({"$name": response[0][0]['fullname'], "$email": response[0][0]['email'] });
        mixpanel.identify(response[0][0]['id']);

        this._applySettings();

        location.assign('/calendar');

    }
    
    
    private _applySettings(){

        let lang = (this._configService.defaults) ? this._configService.defaults.language : 'en';

        this._translateService.setDefaultLang('en');
        this._translateService.use(lang);
        moment.locale(lang);
    }
}
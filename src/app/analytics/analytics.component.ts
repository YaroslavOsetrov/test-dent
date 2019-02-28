import { Component, ViewChild, OnInit } from '@angular/core';

import * as moment from 'moment';

import {ConfigService} from './../common/services/config';

import {UserModel} from './../common/models/user/main';
import {UserRoleModel} from './../common/models/user/user_role';

import {TranslateService} from '@ngx-translate/core';

import { defineLocale } from 'ngx-bootstrap/chronos';

import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';

@Component({
    selector: 'analytics',
    templateUrl: 'analytics.html'
})
export class AnalyticsComponent implements OnInit{

    interval:{start?:any, end?:any} = {
        start:moment().add(-7, 'days').format('YYYY-MM-DD'),
        end:moment().format('YYYY-MM-DD')
    };

    datepickerInterval:any = [];

    intervalChangedTimes = 0;


    users:Array<UserModel> = [];

    selectedUser:UserModel = {
        id:null
    };
    userId:string = null;

    userRole:UserRoleModel = {};

    constructor(private translateService:TranslateService, private _localeService:BsLocaleService, private configService:ConfigService){


        this.datepickerInterval = [moment().add(-7, 'days').toDate(), moment().toDate()];

    }

    ngOnInit(){
        
        this.users = this.configService.users;

        let acc = this.configService.account;

        this.userRole = acc.role;

        if (!this.userRole.view_analytics){
            this.changeUser(this.users[0]);
        }

        defineLocale(moment.locale(), {
            months  : moment.months(),
            monthsShort : moment.monthsShort(),
            weekdays : moment.weekdays(),
            weekdaysShort : moment.weekdaysShort(),
            weekdaysMin  : moment.weekdaysMin(),
            week:{
                dow:this.configService.scheduler.first_day_index,
                doy:new Date(new Date().getFullYear(), 0, 1).getDay()
            }
        })
        this._localeService.use(moment.locale());
    }

    renderChart() {
        
       
    }

    onIntervalChanged(interval){

        this.intervalChangedTimes += 1;

        if (this.intervalChangedTimes >= 3){
            if (interval)
            if (interval.length == 2)
            this.interval = {
                start:moment(interval[0]).format('YYYY-MM-DD'),
                end:moment(interval[1]).format('YYYY-MM-DD')
            };
        }
    }

    changeUser(user){

        if (user == null){
            this.selectedUser = {};

            this.selectedUser.id = null;
            this.userId = null;
        }else{
            this.selectedUser = user;
            this.userId = user.id;
        }

        
        if (!user){
            this.userId = null;
        }
    }

    onIntervalSelected(interval){
     //   this.interval = interval;
    }

}
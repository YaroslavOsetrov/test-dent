import { Component, Input, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';

import * as moment from 'moment';

import {FormGroup, FormBuilder} from '@angular/forms';

import {ConfigService} from '@common/services/config';

import {AnalyticsService} from './analytics.service';

@Component({
    selector: 'procedures-modal',
    templateUrl: 'proceduresModal.html',
    exportAs:'proceduresModal'
})
export class ProceduresModalComponent implements OnInit {


    @ViewChild('proceduresModal') proceduresModal;

    patient:any;
    
    userId:any;

    taskTags:any;

    isLoaded = false;

    interval:any;

    datepickerInterval:any = [];

    usersObj:any;

    procedures:Array<any> =[];

    constructor(private _configService:ConfigService, private analyticsService:AnalyticsService){

        this.usersObj = this._configService.usersObj;
    }

    ngOnInit(){

    }

    show(interval, userId){

        this.interval = interval;

        this.userId = userId;

        this._loadInterval(interval, userId);

        this.proceduresModal.show();   

    }

    onIntervalChanged(interval){

        this.interval = {
            start:moment(interval[0]).format('YYYY-MM-DD'),
            end:moment(interval[1]).format('YYYY-MM-DD')
        };

        this._loadInterval(this.interval, this.userId);


    }

    private _loadInterval(interval, userId){

        this.isLoaded = false;
        this.analyticsService.getStats(interval.start, interval.end, 'proceduresList', userId).subscribe(
            response => {
                this.isLoaded =true;
                this.procedures = response;
            }
        );   

    }
}
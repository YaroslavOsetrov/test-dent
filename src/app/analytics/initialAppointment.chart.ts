import { Component, Input, OnInit, OnChanges, SimpleChange} from '@angular/core';

import {DatePipe} from '@angular/common';

import {AnalyticsService} from './analytics.service';

import {MyCurrencyPipe, DatexPipe} from './../common/pipes';

import {ConfigService} from './../common/services/config';

import {TranslateService} from '@ngx-translate/core';

import {LinearChart} from './chartFormat';

import * as moment from 'moment';

import {Observable} from 'rxjs';
import { forkJoin } from 'rxjs';

declare var google:any;

@Component({
    selector: 'initialAppointment-chart',
    templateUrl: 'initialAppointment.chart.html'
})
export class InitialAppointmentChart implements OnInit, OnChanges{


    @Input() interval:any;

    @Input() userId:string;

    paymentsTop:Array<any> = [];

    labelsFormat = {
        dateAxis:'',
        dateField:''
    };

    apptsStats = {
        total:0,
        canceled:0
    }

    constructor(private analyticsService:AnalyticsService, 
                private datexPipe:DatexPipe,
                private myCurrencyPipe:MyCurrencyPipe, 
                private configService:ConfigService){

    }

    ngOnInit(){

    }

    private renderChart(interval, userId){


        forkJoin(
            this.analyticsService.getStats(interval.start, interval.end, 'initialAppointments', userId),
            this.analyticsService.getStats(interval.start, interval.end, 'initialAppointmentsDeleted', userId),
        ).subscribe(
            response => {
                let total = response[0];
                let deleted = response[1];

                let array = [['Date', 'New patients', 'Canceled']];

                let arrayValues={

                }

                this.apptsStats.canceled = 0;
                this.apptsStats.total = 0;

                total.forEach((row) => {

                    array.push([
                        this.datexPipe.transform(row[this.labelsFormat.dateField], this.labelsFormat.dateAxis), 
                        (row['new_patients']) ? row['new_patients'] : 0
                    ])

                     this.apptsStats.total += (row['new_patients']) ? row['new_patients'] : 0;
                    
                });

                deleted.forEach((row, i) => {

                    array[i+1].push((row['new_patients']) ? row['new_patients'] : 0);
                    
                    this.apptsStats.canceled += (row['new_patients']) ? row['new_patients'] : 0;
                });
                
                let options = Object.assign({}, LinearChart.options);

                options.vAxis.gridlines.count = 3;
                options.seriesType = 'bars';
                options.series = {
                    0: { color: '#00a8ff' }
                };

                google.charts.setOnLoadCallback(()=> {
                    let chart = new google.visualization.ComboChart(document.getElementById('initialAppointment_chart'));
                    chart.draw(google.visualization.arrayToDataTable(array), options);
                });
            }
        );
    }

    ceil(number){
        return Math.ceil(number);
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {


        let duration = moment.duration(moment(this.interval.start, 'YYYY-MM-DD', true).diff(moment(this.interval.end, 'YYYY-MM-DD', true))).asMonths();
    
        if (Math.abs(duration) >= 1){     
            this.labelsFormat.dateField = 'date_month';       
            this.labelsFormat.dateAxis = this.configService.country.locale_format.date_month;
        }else{
            this.labelsFormat.dateField = 'date_day';
            this.labelsFormat.dateAxis = this.configService.country.locale_format.date_short;
        }

        this.renderChart(this.interval, this.userId);

     }
}
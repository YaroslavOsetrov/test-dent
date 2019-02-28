import { Component, Input, OnInit, OnChanges, SimpleChange} from '@angular/core';

import {DatePipe} from '@angular/common';

import {AnalyticsService} from './analytics.service';

import {MyCurrencyPipe, DatexPipe} from './../common/pipes';

import {ConfigService} from './../common/services/config';

import {TranslateService} from '@ngx-translate/core';

import {LinearChart} from './chartFormat';

import * as moment from 'moment';

declare var google:any;

@Component({
    selector: 'patient-chart',
    templateUrl: 'patient.chart.html'
})
export class PatientChart implements OnInit, OnChanges{

    @Input() interval:any;

    @Input() userId:string;

    labelsFormat:{
        dateField:any,
        dateAxis:any
    } = {
        dateField:'',
        dateAxis:''
    };


    constructor(private analyticsService:AnalyticsService, 
                private myCurrencyPipe:MyCurrencyPipe, 
                private configService:ConfigService,
                private datexPipe:DatexPipe){

    }

    ngOnInit(){

    }

    private renderChart(interval, userId){

        this.analyticsService.getStats(interval.start, interval.end, 'patients', userId).subscribe(
            response => {
                
                let array:any = [['Interval', 'New patients']];

                response.forEach((row) => {

                    array.push([
                        this.datexPipe.transform(row[this.labelsFormat.dateField], this.labelsFormat.dateAxis), 
                        (row['new_patients'])? row['new_patients'] : 0
                    ]);
                });

                let data = google.visualization.arrayToDataTable(array);

                let options = Object.assign({}, LinearChart.options);

                options.vAxis.title = 'Patients';

                options.vAxis.format = '#';

                google.charts.setOnLoadCallback(()=> {
                    let chart = new google.visualization.AreaChart(document.getElementById('patient_chart'));
                    chart.draw(data, options);
                });
            }
        );

        

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
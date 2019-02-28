import { Component, Input, OnInit, OnChanges, SimpleChange} from '@angular/core';

import {DatePipe} from '@angular/common';

import {AnalyticsService} from './analytics.service';

import {MyCurrencyPipe, DatexPipe} from './../common/pipes';

import {ConfigService} from './../common/services/config';

import {TranslateService} from '@ngx-translate/core';

import {LinearChart} from './chartFormat';

import * as moment from 'moment';

import {Observable, forkJoin} from 'rxjs';

declare var google:any;

@Component({
    selector: 'workhour-chart',
    templateUrl: 'workhour.chart.html'
})
export class WorkhourChart implements OnInit, OnChanges{


    @Input() interval:any;

    @Input() userId:string;

    paymentsTop:Array<any> = [];

    labelsFormat = {
        dateAxis:'',
        dateField:''
    };

    workhoursStats = {
        appts:0,
        total:0
    };

    constructor(private analyticsService:AnalyticsService, 
                private datexPipe:DatexPipe,
                private myCurrencyPipe:MyCurrencyPipe, 
                private configService:ConfigService){

    }

    ngOnInit(){

    }

    private renderChart(interval, userId){


        forkJoin(
            this.analyticsService.getStats(interval.start, interval.end, 'providerWorkhours', userId),
            this.analyticsService.getStats(interval.start, interval.end, 'providerWorkhoursAll', userId),
        ).subscribe(
            response => {


                let appts = response[0];
                let all = response[1];

                let array:any = [['Date', 'All slots', 'Work hours']];

                let arrayValues={

                };

                this.workhoursStats.appts = 0;
                this.workhoursStats.total = 0;

                all.forEach((row) => {

                    array.push([
                        this.datexPipe.transform(row[this.labelsFormat.dateField], this.labelsFormat.dateAxis), 
                        (row['work_minute']) ? row['work_minute'] : 0
                    ])

                    this.workhoursStats.total += (row['work_minute']) ? row['work_minute'] : 0
                    
                });

                appts.forEach((row, i) => {

                    array[i+1].push((row['work_minute']) ? row['work_minute'] : 0);

                    this.workhoursStats.appts += (row['work_minute']) ? row['work_minute'] : 0
                    
                });

                array.forEach((row, i) => {
                    if (i > 0){
                        row[1] = Math.round(Number(row[1]) /60 * 100) / 100;
                        row[2] = Math.round(Number(row[2]) /60 * 100) / 100;
                    }
                });
                
                let options = Object.assign({}, LinearChart.options);

                options.vAxis.title = 'Work hours';

                options.vAxis.format = '###,###,###.##';
                options.vAxis.gridlines.count = 3;
                options.seriesType = 'bars';
                options.series = {
                    0: { color: '#00a8ff' }
                };

                google.charts.setOnLoadCallback(()=> {
                    let chart = new google.visualization.ComboChart(document.getElementById('workhours_chart'));
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
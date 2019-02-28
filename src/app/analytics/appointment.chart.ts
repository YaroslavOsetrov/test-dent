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
    selector: 'appointment-chart',
    templateUrl: 'appointment.chart.html'
})
export class AppointmentChart implements OnInit, OnChanges{

    @Input() interval:any;

    @Input() userId:string;

    labelsFormat = {
        dateField:'',
        dateAxis:''
    };

    appointmentStats:{
        total:number,
        completed:number,
        confirmed:number,
        cancelled:number
    };


    constructor(private analyticsService:AnalyticsService, 
                private myCurrencyPipe:MyCurrencyPipe, 
                private configService:ConfigService,
                private datexPipe:DatexPipe){

    }

    ngOnInit(){

    }

    private renderChart(interval, userId){

        this.appointmentStats = {
            total:0,
            completed:0,
            confirmed:0,
            cancelled:0
        };

        this.analyticsService.getStats(interval.start, interval.end, 'appointments', userId).subscribe(
            response => {
                
                let array:any = [['Month', 'Cancelled', 'Total']];

                response.forEach((row) => {

                    if (row['total'] != null){
                        array.push([
                            this.datexPipe.transform(row[this.labelsFormat.dateField], this.labelsFormat.dateAxis), 
                            row['cancelled'],
                            row['total']
                        ]);
                        this.appointmentStats.total += row['total'];
                        this.appointmentStats.completed += row['completed'];
                        this.appointmentStats.confirmed += row['confirmed'];
                        this.appointmentStats.cancelled += row['cancelled'];
                    }else{
                         array.push([
                            this.datexPipe.transform(row[this.labelsFormat.dateField], this.labelsFormat.dateAxis), 
                            0,
                            0
                        ]);
                    }
                });

                let data = google.visualization.arrayToDataTable(array);

                let options = Object.assign({}, LinearChart.options);

                options.vAxis.title = 'Appointments';

                options.vAxis.format = '#';

                options.series = {
                   
                    0: {
                        type: 'area',
                        color: '#fa424a',
                        pointSize: 4,
                        areaOpacity: 0.18,
                        pointShapeType: 'circle'
                    },
                   1: { color: '#46c35f', type: 'area',
                        pointSize: 4,
                        areaOpacity: 0.18,
                        pointShapeType: 'circle' }
                };

                google.charts.setOnLoadCallback(()=> {
                    let chart = new google.visualization.AreaChart(document.getElementById('appointment_chart'));
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
import { Component, Input, OnInit, OnChanges, SimpleChange} from '@angular/core';

import {DatePipe} from '@angular/common';

import {AnalyticsService} from './analytics.service';

import {MyCurrencyPipe, DatexPipe} from './../common/pipes';

import {ConfigService} from './../common/services/config';

import {TranslateService} from '@ngx-translate/core';

import {PieChart} from './chartFormat';


import * as moment from 'moment';

declare var google:any;

@Component({
    selector: 'patientSource-chart',
    templateUrl: 'patientSource.html'
})
export class PatientSourceChart implements OnInit, OnChanges{


    @Input() interval:any;

    @Input() userId:string;

    referenceFrom:Array<any> = [];

    constructor(private analyticsService:AnalyticsService, 
                private myCurrencyPipe:MyCurrencyPipe, 
                private configService:ConfigService){

    }

    ngOnInit(){

    }

    private renderChart(interval, userId){
        
        this.analyticsService.getStats(interval.start, interval.end, 'patientsReference', userId).subscribe(
            response => {

                let array = [['Titles', 'Values']];

                let arrayValues={

                }

                response.forEach((row) => {

                    if (row['reference_from'] != null){
                        if (!arrayValues.hasOwnProperty(row['reference_from'])){
                            arrayValues[row['reference_from']] = 0;
                        }
                        arrayValues[row['reference_from']] += row['new_patients'];
                    }
                    

                });
                
                this.referenceFrom = [];

                for (let key in arrayValues){
                    array.push([key, arrayValues[key]]);

                    this.referenceFrom.push([key, arrayValues[key]]);
                }
                
                google.charts.setOnLoadCallback(()=> {
                    let chart = new google.visualization.PieChart(document.getElementById('patientReference_chart'));
                    chart.draw(google.visualization.arrayToDataTable(array), PieChart.options);
                });

            }
        )
    }

     ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {

        this.renderChart(this.interval, this.userId);

     }



}
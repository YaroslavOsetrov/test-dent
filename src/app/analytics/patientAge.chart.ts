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
    selector: 'patientAge-chart',
    templateUrl: 'patientAge.html'
})
export class PatientAgeChart implements OnInit, OnChanges{


    @Input() interval:any;

    @Input() userId:string;

    ageRange:Array<any> = [];

    constructor(private analyticsService:AnalyticsService, 
                private myCurrencyPipe:MyCurrencyPipe, 
                private configService:ConfigService){

    }

    ngOnInit(){

    }

    private renderChart(interval, userId){
        
        this.analyticsService.getStats(interval.start, interval.end, 'patientsAge', userId).subscribe(
            response => {

                let array = [['Titles', 'Values']];

                let arrayValues={
                    under18:0,
                    under24:0,
                    under35:0,
                    under46:0,
                    under60:0,
                    above60:0
                }

                response.forEach((row) => {
                    if (row.hasOwnProperty('under18')){
                        arrayValues['under18'] += row['under18'];
                        arrayValues['under24'] += row['under24'];
                        arrayValues['under35'] += row['under35'];
                        arrayValues['under46'] += row['under46'];
                        arrayValues['under60'] += row['under60'];
                        arrayValues['above60'] += row['above60'];
                    }
                    

                });
                
                this.ageRange = [];

                for (let key in arrayValues){
                    array.push([key, arrayValues[key]]);

                    this.ageRange.push([key, arrayValues[key]]);
                }

                google.charts.setOnLoadCallback(()=> {
                    let chart = new google.visualization.PieChart(document.getElementById('patientAge_chart'));
                    chart.draw(google.visualization.arrayToDataTable(array), PieChart.options);
                });

            }
        )
    }

     ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {

        this.renderChart(this.interval, this.userId);

     }



}
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
    selector: 'procedureTypes-chart',
    templateUrl: 'procedureTypes.chart.html'
})
export class ProcedureTypesChart implements OnInit, OnChanges{


    @Input() interval:any;

    @Input() userId:string;

    proceduresTop:Array<any> = [];

    constructor(private analyticsService:AnalyticsService, 
                private myCurrencyPipe:MyCurrencyPipe, 
                private configService:ConfigService){

    }

    ngOnInit(){

    }

    private renderChart(interval, userId){
        
        this.analyticsService.getStats(interval.start, interval.end, 'procedureTypes', userId).subscribe(
            response => {

                this.proceduresTop = [];

                let array = [['Titles', 'Values']];

                let arrayValues={

                };

                response.forEach((row) => {

                    if (row['chart_code'] == null){
                        row['chart_code'] = 'blank';
                    }

                    if (row['chart_code'] != null){
                        if (!arrayValues.hasOwnProperty(row['chart_code'])){
                            arrayValues[row['chart_code']] = 0;
                        }

                        arrayValues[row['chart_code']] += row['procedure_price'];
                    }
                });

                let sortable = [];
                for (let key in arrayValues) {
                    sortable.push([key, arrayValues[key]]);
                }
                sortable.sort(function(a, b) {
                    return b[1] - a[1];
                });
                
                let sortableFinal = [];
                sortable.forEach((row, i) => {
                    if (i<=4){
                        sortableFinal.push([row[0], row[1]]);
                    }
                });

                this.proceduresTop = sortableFinal;
                
                array = array.concat(sortableFinal);

                google.charts.setOnLoadCallback(()=> {
                    let chart = new google.visualization.PieChart(document.getElementById('procedureType_chart'));
                    chart.draw(google.visualization.arrayToDataTable(array), PieChart.options);
                });

            }
        )
    }

     ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {

        this.renderChart(this.interval, this.userId);

     }



}
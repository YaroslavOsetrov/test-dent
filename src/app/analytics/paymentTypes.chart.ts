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
    selector: 'paymentTypes-chart',
    templateUrl: 'paymentTypes.chart.html'
})
export class PaymentTypesChart implements OnInit, OnChanges{


    @Input() interval:any;

    @Input() userId:string;

    paymentsTop:Array<any> = [];

    constructor(private analyticsService:AnalyticsService, 
                private myCurrencyPipe:MyCurrencyPipe, 
                private configService:ConfigService){

    }

    ngOnInit(){

    }

    private renderChart(interval, userId){
        
        this.analyticsService.getStats(interval.start, interval.end, 'paymentTypes', userId).subscribe(
            response => {

                let array = [['Titles', 'Values']];

                let arrayValues={

                }

                response.forEach((row) => {

                    if (row['payment_code'] != null){
                        if (!arrayValues.hasOwnProperty(row['payment_code'])){
                            arrayValues[row['payment_code']] = 0;
                        }
                        arrayValues[row['payment_code']] += row['paid_amt'];
                    }
                    

                });
                
                this.paymentsTop = [];

                for (let key in arrayValues){

                    if (arrayValues[key] > 0){
                        array.push([key, arrayValues[key]]);
                        this.paymentsTop.push([key, arrayValues[key]]);
                    }
                        
                }

                google.charts.setOnLoadCallback(()=> {
                    let chart = new google.visualization.PieChart(document.getElementById('paymentType_chart'));
                    chart.draw(google.visualization.arrayToDataTable(array), PieChart.options);
                });

            }
        )
    }

     ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {

        this.renderChart(this.interval, this.userId);

     }



}
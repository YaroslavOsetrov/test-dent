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
    selector: 'payment-chart',
    templateUrl: 'payment.chart.html'
})
export class PaymentChart implements OnInit, OnChanges{

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

        this.analyticsService.getStats(interval.start, interval.end, 'payments', userId).subscribe(
            response => {

                let array = [['Month', 'Value']];

                response.forEach((row) => {
                    array.push([
                        this.datexPipe.transform(row[this.labelsFormat.dateField], this.labelsFormat.dateAxis), 
                        (row['paid_amt']) ? row['paid_amt'] : 0
                     ])
                });
                
                let data = google.visualization.arrayToDataTable(array);

                let options = Object.assign({}, LinearChart.options);

                options.vAxis.format = '###,###,###,###.##';
                let currency = this.myCurrencyPipe.transform('0', this.configService.defaults.currency_code, true);

                if (this.configService.defaultCurrency.is_currency_prefix){
                    options.vAxis.format = currency + options.vAxis.format;
                }else{
                    options.vAxis.format = options.vAxis.format + currency;
                }

                let formatter = new google.visualization.NumberFormat( 
                    {
                        decimalSymbol: '.',
                        groupingSymbol: ',', 
                        prefix: (this.configService.defaultCurrency.is_currency_prefix) ? currency : '',
                        suffix: (!this.configService.defaultCurrency.is_currency_prefix) ? currency : ''
                    }
                ); 
                formatter.format(data, 1);

               // options.vAxis.format = 'currency';
                options.vAxis.title = 'Amount';

                google.charts.setOnLoadCallback(()=> {
                    let chart = new google.visualization.AreaChart(document.getElementById('payment_chart'));
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
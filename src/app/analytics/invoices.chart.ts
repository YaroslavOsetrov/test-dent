
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
    selector: 'invoices-chart',
    templateUrl: 'invoices.chart.html'
})
export class InvoicesChart implements OnInit, OnChanges{


    @Input() interval:any;

    @Input() userId:string;

    invoiceStats:{
        total_income:number,
        total_discounts:number,
        total_debts:number,
        total_tax:number
    } = {
        total_income:0,
        total_discounts:0,
        total_debts:0,
        total_tax:0
    };

    constructor(private analyticsService:AnalyticsService, 
                private myCurrencyPipe:MyCurrencyPipe, 
                private configService:ConfigService,
                private datexPipe:DatexPipe){

    }


    ngOnInit(){}

    private renderChart(interval, userId){

        this.analyticsService.getStats(interval.start, interval.end, 'invoices', userId).subscribe(
            response => {
                
                this.invoiceStats.total_income = 0;
                this.invoiceStats.total_discounts = 0;
                this.invoiceStats.total_debts = 0;
                this.invoiceStats.total_tax = 0;

                response.forEach((row) => {

                    this.invoiceStats.total_income += row['payed_amt'];
                    this.invoiceStats.total_tax += row['total_tax'];
                    this.invoiceStats.total_debts += row['total_debts'];
                    this.invoiceStats.total_discounts += row['total_discounts'];

                })
            }
        );
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {


        this.renderChart(this.interval, this.userId);

     }

}
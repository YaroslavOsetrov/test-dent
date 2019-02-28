import { Component, Input, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';

import * as moment from 'moment';

import {FormGroup, FormBuilder} from '@angular/forms';

import {AnalyticsService} from './analytics.service';

@Component({
    selector: 'payment-modal',
    templateUrl: 'paymentModal.chart.html',
    exportAs:'paymentModal'
})
export class PaymentModalComponent implements OnInit {


    @ViewChild('paymentModal') paymentModal;

    patient:any;

    taskTags:any;

    isLoaded = false;

    constructor(private analyticsService:AnalyticsService){}

    ngOnInit(){

    }

    payments:Array<any> = [];

    show(interval, userId){

        this.isLoaded = false;

        this.analyticsService.getStats(interval.start, interval.end, 'paymentsList', userId).subscribe(
            response => {

                this.isLoaded = true;

                this.payments = response;
            }
        );   

        this.paymentModal.show();   

    }
}
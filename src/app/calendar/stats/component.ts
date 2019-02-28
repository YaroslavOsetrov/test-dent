import { Component, Output, Input, OnChanges, OnInit, EventEmitter, HostListener, ViewChild } from '@angular/core';

import {ConfigService} from '@common/services/config';

import {OrganizationService} from './../../settings/organization/service';

import * as moment from 'moment';

import {SweetAlertService} from '@common/services/sweetalert';
import {AppointmentService} from './../calendar.service';


@Component({
    selector: 'stats',
    templateUrl: 'component.html'
})
export class StatsComponent implements OnInit {

    today:any;

    stats = {
        cancelled_appts:0,
        new_patients:0,
        paid_amt:0,
        total_appts:0
    };

    expanded = false;

    constructor(private _swalService:SweetAlertService, private _appointmentService:AppointmentService){

        this.today = moment().format('YYYY-MM-DD');

    }

    ngOnInit(){

        this._appointmentService.getDailyStats(this.today).subscribe(
            response => {
                this.stats = response;
            }
        )

    }

    toggle(){
        this.expanded = !this.expanded;
    }

    print(){

        this._swalService.loader({
            title:'patient.charting.print.title',
            text: 'patient.charting.print.descr'
        }, this._appointmentService.printAppts(this.today), (response) => {

            this._swalService.download({
                title:'patient.doc.ready.title',
                text:'patient.doc.ready.descr'
            }, {
                url:response['filename']
            })
        });

    }

}
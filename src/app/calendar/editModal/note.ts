import { Component, OnInit, ViewChild, Output, Input, EventEmitter } from '@angular/core';

import {AppointmentModel} from '@common/models/appointment/main';

import {PatientInvoiceModel} from '@common/models/user/patient/invoice';

import {ConfigService} from '@common/services/config';

import {AppointmentService} from './../calendar.service';

import {BillingService} from '@patients/profile/practice/billing/service';

import {TranslateService} from '@ngx-translate/core';

import {OrganizationNotificationService} from '@settings/templates/service';

import {SweetAlertService} from '@common/services/sweetalert';

@Component({
    selector: 'note',
    templateUrl: 'note.html'
})
export class NoteComponent implements OnInit {


    @Input('appointment') appointment:any;
    @Output('onSaved') onSaved = new EventEmitter<any>();
    @Output('onDeleted') onDeleted = new EventEmitter<any>();

    isSubmitted = false;

    constructor(private _apptService:AppointmentService,  private _swalService:SweetAlertService){


    }

    ngOnInit(){

    }

    save(){

        let appointment:AppointmentModel = Object.assign({}, this.appointment);

        appointment.start = null;
        appointment.end = null;
        appointment.source = null;

        this.isSubmitted = true;

        this._apptService.saveBlank(appointment).subscribe(
            response => {
                this.isSubmitted = false;
                this.onSaved.emit(this.appointment);
            }
        )
    }

    cancel(){
         this._swalService.confirm({
            title: 'cal.delete.title',
            text: 'cal.delete.descr'
        }).then((confirmed) => {
            this.appointment.is_deleted = true;
            this.onDeleted.emit(this.appointment);

            let appt = Object.assign({}, this.appointment);

            appt.start = null;
            appt.end = null;
            appt.source = null;
            
            this._apptService.saveBlank(appt).subscribe();
            
        });
    }

}
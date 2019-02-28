import { Component, OnInit, ViewChild, Output, Input, EventEmitter } from '@angular/core';

import {AppointmentModel} from '@common/models/appointment/main';

import {PatientInvoiceModel} from '@common/models/user/patient/invoice';

import {ConfigService} from '@common/services/config';

import {AppointmentService} from './../calendar.service';

import {PatientService} from '@patients/patients.service';

import {BillingService} from '@patients/profile/practice/billing/service';

import {TranslateService} from '@ngx-translate/core';

import {OrganizationNotificationService} from '@settings/templates/service';

import {SweetAlertService} from '@common/services/sweetalert';

@Component({
    selector: 'widget',
    templateUrl: 'widget.html'
})
export class WidgetComponent implements OnInit {

    @Input('appointment') appointment:any;

    @Output('onSaved') onSaved = new EventEmitter<any>();
    @Output('onDeleted') onDeleted = new EventEmitter<any>();

    patient:any;
    provider:any;

    isSubmitted = false;


    constructor(private _configService:ConfigService, private _patientService:PatientService, private _appointmentService:AppointmentService){

    }

    ngOnInit(){

    }

    save(){

        this.isSubmitted = true;

        let appt = Object.assign({}, this.appointment);

        appt['start_time'] = appt['start'].format('HH:mm');

        appt['end_time'] = appt['end'].format('HH:mm');

        appt['start'] = null;
        appt['end'] = null;
        appt['widget'] = null;
        appt['source'] = null;

        delete appt['id'];
    
        this.provider = this._configService.usersObj[this.appointment['widget']['provider_id']];

        if (this.appointment['widget']['patient']){
            this.patient = this.appointment['widget']['patient'];

            this._appointmentService.add(this.patient['id'], appt).subscribe(
                appt => {
                    this._afterSave(appt);
                }
            );

        }else
            this._patientService.add({fullname:this.appointment.widget['fullname'], phone:this.appointment.widget['phone']}).subscribe(
                patient => {
                    this.patient = patient;
                    appt['patient_id'] = patient['id'];
                    this._appointmentService.add(patient['id'], appt).subscribe(
                        appt => {
                            this._afterSave(appt);
                        }
                    );
                    
                }
            )
    }

    cancel(){
        this._appointmentService.deleteBooking(this.appointment.widget['id']).subscribe();
        this.onDeleted.emit(this.appointment);
    }

    private _afterSave(appt):void{
        
        appt['patient'] = this.patient;
        appt['provider'] = this.provider;

        appt['start'] = this.appointment.start;
        appt['end'] = this.appointment.end;
        appt['source'] = this.appointment.source;

        appt['widget'] = true;
        appt['widget_id'] = this.appointment.id;

        this._appointmentService.deleteBooking(appt['widget_id']).subscribe();

        this.onSaved.emit(appt);

        this.isSubmitted = false;
        this.patient = null;
    }

}
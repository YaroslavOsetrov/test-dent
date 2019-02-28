import { Component, ElementRef, OnInit, ViewChild, Output, Input, EventEmitter } from '@angular/core';

import {AppointmentModel} from '@common/models/appointment/main';

import {PatientInvoiceModel} from '@common/models/user/patient/invoice';

import {ConfigService} from '@common/services/config';

import {TabsetComponent} from 'ngx-bootstrap/tabs';

import {AppointmentService} from './../calendar.service';

import {BillingService} from '@patients/profile/practice/billing/service';

import {TranslateService} from '@ngx-translate/core';

import {OrganizationNotificationService} from '@settings/templates/service';

import {SweetAlertService} from '@common/services/sweetalert';

import {ModalStateService} from '@common/services/global';

@Component({
    selector: 'edit-modal',
    templateUrl: 'component.html',
    exportAs:'editModal'
})
export class EditModalComponent implements OnInit {

    @ViewChild('editModal') editModal;

    @ViewChild('charting') charting;

    @ViewChild('invoicesTable') invoicesTable;

    @ViewChild('staticTabs') staticTabs:TabsetComponent;

    setDefaultTab = true;

    @Output('paymentAdded') paymentAdded = new EventEmitter<any>();
    @Output('invoiceAdded') invoiceAdded = new EventEmitter<any>();

     @Output('invoiceDeleted') invoiceDeleted = new EventEmitter<any>();

    @Output('appointmentEdited') onAppointmentEdited:EventEmitter<AppointmentModel> = new EventEmitter<AppointmentModel>();

    @Output('appointmentDeleted') onAppointmentDeleted:EventEmitter<AppointmentModel> = new EventEmitter<AppointmentModel>();

    appointment:AppointmentModel ={
        note:''
    }

    appointmentDef = {
        note:'',
        notify_create:false,
        notify_before:false
    };

    loadedTabs = {
        'charting':false,
        'notes':false,
        'billing':false,
        'storage':false
    };

    apptStatus = [{
        translate_code:'conf', icon_code:'clock', class_code:'info', db_code:'is_confirmed'
    }, {
        translate_code:'compl', icon_code:'check', class_code:'success', db_code:'is_completed'
    }, {
        translate_code:'noshow', icon_code:'close', class_code:'danger', db_code:'is_noshow'
    }];

    defaultDentalChart = {};

    withoutPatient = false;

    isExpanded = false;

    widgetPatient = false;

    localeFormat:any;

    isLoaded:boolean = false;

    overlayedModal = false;
    
   //f isAllowEdit = false;

    isAllowView = false;

    schedulerOptions:any;
    userRole:any;

    users = {};

    showDetails = false;

    hidePrimaryModal = false;

    constructor(private _modalState:ModalStateService, private configService:ConfigService, private _swalService:SweetAlertService, private translateService:TranslateService, private billingService:BillingService, private appointmentService:AppointmentService){


    }

    ngOnInit(){

        this._modalState.showModal$.subscribe(
            isShown => {
                this.hidePrimaryModal = isShown;
            }
        )


        this.configService.users.forEach((row) => {
            this.users[row.id] = row;
        })

        this.localeFormat = this.configService.country.locale_format;

       // this.isAllowEdit = this.configService.account.role.edit_app;
        
        this.userRole = this.configService.account.role;

        this.schedulerOptions = this.configService.scheduler;        
    }


    show(appointment){

        mixpanel.track("calendarEditApptShow");

        this.isExpanded = false;
        this.setDefaultTab = true;

        this.appointment = null;

        this.loadedTabs = {
            'charting':false,
            'notes':false,
            'billing':false,
            'storage':false
        };

        this.appointment = appointment;
        this.appointmentDef.note = this.appointment.note;
        this.appointmentDef.notify_before = this.appointment.notify_before;
        this.appointmentDef.notify_create = this.appointment.notify_create;

        if (!this.appointment.provider){
            this.appointment.provider = this.users[this.appointment.provider_id];
        }

        this.showDetails = true;

        this.withoutPatient = (appointment.patient_id == null);

        this.widgetPatient = appointment['widget'];
        
        setTimeout(() => {
            this.staticTabs.tabs[0].active = true;
        }, 100);
        this.editModal.show();


        if (appointment.patient_id == null)
            return;

    }

    cancel(){
        this._swalService.confirm({
            title: 'cal.delete.title',
            text: 'cal.delete.descr'
        }).then((confirmed) => {
            this.appointment.is_deleted = true;

            let appt = Object.assign({}, this.appointment);

            appt.start = null;
            appt.end = null;
            appt.source = null;

            this.editModal.hide();
            this.onAppointmentDeleted.emit(appt);

            if (this.withoutPatient)
                this.appointmentService.saveBlank(appt).subscribe();
            else
                this.appointmentService.save(appt.patient_id, appt.id, appt).subscribe();
        });
    }
/*
    getMedicalNotes(){
        if (!this.appointment)
            return [];
        
        let field:any

        let setted = false;
      
        ['allergies', 'urgent', 'medications', 'current_ill', 'past_ill'].forEach((row) => {

            if (!setted)
            if (this.appointment.patient[row]){
                setted = true;
                field = this.appointment.patient[row];
            }
        });
        
        if (typeof field === 'string')
            try{
                field = JSON.parse(field);
            }catch (e){
                field = null;
            }
            
        
        let fieldOut = [];

        if (field)
        field.forEach((row) => {
            if (row && row['displayValue'])
            fieldOut.push(row['displayValue']);
        })

        return fieldOut.join(', ');
    }
*/
    onInvoiceAdded(event){
        let invoice = event; 
        invoice.patient = this.appointment.patient; 
        invoice.createdAt = this.appointment.date;
        this.invoiceAdded.emit(invoice)
    }

    changeStatus(db_code){

        if (db_code == 'is_noshow'){
            this.appointment['is_completed'] = false;
            this.appointment['is_confirmed'] = false;
        }

        this.appointment[db_code] = !this.appointment[db_code];

        this.save(true);
    }

    onProviderSelected(provider):void{

        this.appointment.provider = provider;
        this.appointment.provider_id = provider['id'];

    }

    close(){
        this.editModal.hide();
        this.showDetails = false;
    }

    save(keepModal?){

        this.appointment.note = this.appointmentDef.note;
        this.appointment.notify_create = this.appointmentDef.notify_create;
        this.appointment.notify_before = this.appointmentDef.notify_before;

        let appointment:AppointmentModel = Object.assign({}, this.appointment);

        appointment.start = null;
        appointment.end = null;
        appointment.source = null;

        this.isLoaded = true;

        if (this.withoutPatient)
            this.appointmentService.saveBlank(appointment).subscribe(
                response => {
                    this.onAppointmentEdited.emit(this.appointment);
                    this.isLoaded = false;
                    if (!keepModal)
                        this.editModal.hide();
                }
            )
        else
            this.appointmentService.save(this.appointment.patient_id, this.appointment.id, appointment).subscribe(
                response => {
                    this.onAppointmentEdited.emit(this.appointment);
                    this.isLoaded = false;
                    if (!keepModal)
                        this.editModal.hide();
                }
            )

    }

}
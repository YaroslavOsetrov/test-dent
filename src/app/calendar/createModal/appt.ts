import { Component, OnInit, OnChanges, ViewChild, Output, Input, EventEmitter } from '@angular/core';

import {FormBuilder, FormGroup} from '@angular/forms';

import {ValidationService} from './../../common/modules/validation';

import {ConfigService} from './../../common/services/config';

import * as moment from 'moment';

import {UserModel} from './../../common/models/user/main';
import {AppointmentModel} from './../../common/models/appointment/main';

import {PatientModel} from './../../common/models/user/patient/main';

import {AppointmentService} from './../calendar.service';

import {PatientService} from './../../patients/patients.service';

@Component({
    selector: 'appt',
    templateUrl: 'appt.html'
})
export class ApptComponent implements OnInit, OnChanges {

    isSubmitted = false;

    newAppointment:FormGroup;

    @Input('appt') appt:AppointmentModel;

    @Input('defaultPatient') defaultPatient:any;

    @Output('apptAdded') apptAdded = new EventEmitter<any>();

    @ViewChild('patientSelect') patientSelect:any;

    selectedPatient:any;

    isOpen = false;

    noPatient = false;

    doctorsCount = 0;

    constructor(private configService:ConfigService, 
                private patientService:PatientService,
                private appointmentService:AppointmentService, private fb:FormBuilder){

        this.newAppointment = this.fb.group({
            fullname:  ['', [ValidationService.requiredValidator]],
            phone:  ['', [ValidationService.requiredValidator]],
            note: '',
            start_time:[''],
            notify_create:[true],
            notify_before:[true]
        });

        this.doctorsCount = this.configService.users.filter((row => row.user_roles[0].is_doctor == true)).length;
    }

    ngOnInit(){

    }

    ngOnChanges(){
        if (this.defaultPatient){
            this.onPatientSelected({is_new:false, patient:this.defaultPatient});
        }
    }
    
    onProviderSelected(provider):void{

        this.appt.provider = provider;
        this.appt.provider_id = provider['id'];

    }

    onPatientSelected(event){
  
        if (!event.is_new){
            this.selectedPatient = event.patient;
            this.newAppointment.controls.phone.markAsTouched();
            this.newAppointment.controls.phone.setValue(event.patient.patient_user.phone);
            this.newAppointment.controls.fullname.setValue(event.patient.patient_user.fullname);
        }else{
            this.selectedPatient = null;
            this.newAppointment.controls.phone.setValue('');
            this.newAppointment.controls.phone.markAsUntouched();
        }
    }

     submitNote(){

        let apptData = this.newAppointment.value;

        this.appt.note = apptData.note;
        this.appt.notify_before = true;
        this.appt.notify_create = true;

        if (!this.appt.note)
            return false;

        this.isSubmitted = true;

        this.appointmentService.addBlank(this.appt).subscribe(
            appt => {
                this.isSubmitted = false;
                this.newAppointment.reset();
                this.noPatient = false;

                this.apptAdded.emit(appt);
            }
        );
    }

    submit(){
        
        if (!this.newAppointment.valid)
            return false;

        if (!this.appt.start_time || !this.appt.end_time || !this.appt.date)
            return false;

        let apptData = this.newAppointment.value;

        this.appt.note = apptData.note;
        this.appt.notify_before = true;
        this.appt.notify_create = true;

        if (!this.appt['section_sub_index']){
            this.appt['section_sub_index'] = 0;
        }
        
       
        this.isSubmitted = true;

        if (this.selectedPatient && this.selectedPatient.patient_user.fullname == this.newAppointment.value.fullname && this.selectedPatient.patient_user.phone == this.newAppointment.value.phone){
            this.appt.patient_id = this.selectedPatient.id;
            
            this.appointmentService.add(this.appt.patient_id, this.appt).subscribe(
                response => {
                    this.createApptDef(response, this.selectedPatient, this.appt);
                }
            );
        }else{
             apptData.fullname = apptData.fullname
                .toLowerCase()
                .split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                .join(' ');
                
            this.patientService.add({fullname:apptData.fullname, phone:apptData.phone}).subscribe(
                patient => {
                    this.appointmentService.add(patient['id'], this.appt).subscribe(
                        response => {

                            this.createApptDef(response, patient, this.appt);
                        }
                    );
                    
                }
            )
        }

    }

    private createApptDef(appt, patient, mergeAppt){
        this.isSubmitted = false;
        appt['patient'] = patient;
        appt['provider'] = this.appt.provider;

        appt['resourceId'] = mergeAppt['room_id'];
        appt['office_id'] = mergeAppt['office_id'];
        
        this.apptAdded.emit(appt);
        
        this.patientSelect.reset();

        this.selectedPatient = null;
        this.newAppointment.reset();

               
    }


}
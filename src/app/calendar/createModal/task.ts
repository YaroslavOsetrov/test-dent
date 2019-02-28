import { Component, OnInit, ViewChild, Output, Input, EventEmitter } from '@angular/core';

import {FormBuilder, FormGroup} from '@angular/forms';

import {ValidationService} from './../../common/modules/validation';

import {ConfigService} from './../../common/services/config';

import * as moment from 'moment';

import {UserModel} from './../../common/models/user/main';
import {AppointmentModel} from './../../common/models/appointment/main';

import {PatientModel} from './../../common/models/user/patient/main';

import {AppointmentService} from './../calendar.service';

import {PatientService, PatientTaskService} from './../../patients/patients.service';
@Component({
    selector: 'task',
    templateUrl: 'task.html'
})
export class TaskComponent implements OnInit {


    newTask:FormGroup;

    @Output('taskAdded') taskAdded = new EventEmitter<any>();

    @Input('appt') appt:AppointmentModel;

    task:any = {};

    selectedPatient:any;

    isSubmitted = false;

    constructor(private configService:ConfigService, 
                private patientService:PatientService,
                private patientTaskService:PatientTaskService,
                private appointmentService:AppointmentService, private fb:FormBuilder){
        
        this.task['provider'] = this.configService.users[0];
       

        this.newTask = this.fb.group({
            fullname:[''],
            date:[''],
            provider_id:[this.configService.users[0].id],
            patient_id:['', ValidationService.requiredValidator],
            title:['',ValidationService.requiredValidator],
            note:[''],
            tag_key:['']
        });
        
        this.newTask.controls.provider_id.setValue(this.configService.users[0]['id']);

    }

    ngOnInit(){

    }

    onTagSelected(tag){
        this.newTask.controls.tag_key.setValue(tag);
    }


    onProviderSelected(provider):void{
        this.task['provider'] = provider;
        this.newTask.controls.provider_id.setValue(provider['id']);

    }

    onPatientSelected(event){
        if (!event.is_new){
            this.selectedPatient = event.patient;
            this.newTask.controls.fullname.setValue(event.patient.patient_user.fullname);
            this.newTask.controls.patient_id.setValue(event.patient.id);
        }else{
            this.newTask.controls.fullname.setValue('');
            this.newTask.controls.patient_id.setValue('');
        }
    }

    submit(){

        this.newTask.controls.date.setValue(this.appt.date);

        if (!this.newTask.valid)
            return false;

        this.isSubmitted = true;

        this.patientTaskService.add(this.newTask.value.patient_id, this.newTask.value).subscribe(
            response => {
                this.isSubmitted = false;

                response['patient'] = this.selectedPatient;
                
                this.taskAdded.emit(response);
            }
        )

    }

}
import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';

import {ConfigService} from './../../../../../common/services/config';

import {PatientService} from './../../../../patients.service';

import * as moment from 'moment';

@Component({
    selector: 'addTasks-modal',
    templateUrl: 'component.html',
    exportAs:'addTasksModal'
})
export class AddTasksModalComponent implements OnInit {

    isSaving = false;

    @ViewChild('addTasksModal') addTasksModal:any;

    @Output('taskAdded') taskAdded = new EventEmitter<any>();

    @Input('selectPatient') selectPatient:any;

    task;

    localeFormat:any;

    patient:any;

    constructor(private _configService:ConfigService, 
                private _patientService:PatientService){


        this.localeFormat = this._configService.country.locale_format;

        this._initTask();
    }

    ngOnInit(){

        this._patientService.patientId$.subscribe(
            patientId => {
                this.task.patient_id = patientId;
            }
        )

    }

    onPatientSelected(selectedPatient){

        if (this.selectPatient){
            if (selectedPatient['patient']){
                this.task.patient_id = selectedPatient['patient']['id'];
                this.task.patient = selectedPatient['patient'];
            }
                
            else
                this.task.patient_id = null;
        }
    }

    switchProvider(user){
        this.task.provider = user;
        this.task.provider_id = user.id;
    }

    show(){
        this.addTasksModal.show();
    }

    hide(){
        this.addTasksModal.hide();
        this._initTask();
    }

    private _initTask(){
        this.task = {
            title:'',
            note:'',
            date:moment().format(this.localeFormat.date_input_mask_mom),
            provider:this._configService.account,
            provider_id:this._configService.account.id,
            patient_id:null
        }
    }

    save(){

        if (!this.task.title || !this.task.patient_id || !this.task.date)
            return false;     
        
        this.isSaving = true;

        this.task.date = moment(this.task.date, this.localeFormat.date_input_mask_mom).format('YYYY-MM-DD');
 
        this._patientService.addTask(this.task.patient_id, this.task).subscribe(
            response => {
                this.isSaving = false;
                
                let out = {
                    id:response['id'].toUpperCase(),
                    date:response['date'],
                    note:response['note'],
                    title:response['title'],
                    patient_id:response['patient_id'],
                    provider_id:response['provider_id'],
                    provider:this.task.provider,
                    patient:this.task.patient,
                    provider2:this.task.provider,
                    patient2:this.task.patient
                };
                this.taskAdded.emit(out);
                this.addTasksModal.hide();
                

                this._initTask();

                
            }
        )
    }

}

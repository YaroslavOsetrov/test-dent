import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import {ConfigService} from '@common/services/config';

import {SweetAlertService} from '@common/services/sweetalert';

import {PatientService} from '@patients/patients.service';

import * as moment from 'moment';

@Component({
    selector: 'detailTask-modal',
    templateUrl: 'component.html',
    exportAs:'detailTaskModal'
})
export class DetailTaskModalComponent implements OnInit {


    isSaving = false;

    @ViewChild('detailTaskModal') detailTaskModal:any;

    @Input('showPatient') showPatient = false;

    @Input('hideUser') hideUser = false;

    @Output('taskSaved') taskSaved = new EventEmitter<any>();
    @Output('taskDeleted') taskDeleted = new EventEmitter<any>();

    task:any;

    taskDefault:any;

    localeFormat:any;

    constructor(private _swalService:SweetAlertService,
                private _configService:ConfigService, 
                private _patientService:PatientService){

        this._initTask();
        
        this.localeFormat = this._configService.country.locale_format;


    }

    ngOnInit(){



    }

    show(task){
        this.task = Object.assign({}, task);
        this.taskDefault = task;

        if (this.task.date)
            this.task.date = moment(this.task.date, 'YYYY-MM-DD').format(this.localeFormat.date_input_mask_mom);

        this.detailTaskModal.show();
    }
    
    switchProvider(user){
        this.task.provider = user;
        this.task.provider_id = user.id;
    }

    save(){

        this.isSaving = true;

        let task = Object.assign({}, this.task);

        task.date = moment(this.task.date, this.localeFormat.date_input_mask_mom).format('YYYY-MM-DD');

        this._patientService.saveTask(task.patient_id, task.id, task).subscribe(
            response => {
                this.isSaving = false;
                this.detailTaskModal.hide();
                this.taskSaved.emit(task);

                this.taskDefault = task;
            }
        )
    }

    delete(){

        this._swalService.confirm({title:'task.delete_conf.title', text:'task.delete_conf.descr'}).then(
            confirmed => {
                if (confirmed){
                     this._patientService.deleteTask(this.task.patient_id, this.task.id).subscribe();
                     this.taskDeleted.emit(this.task);
                     this.detailTaskModal.hide();
                }
            } 
        )
    }

    private _initTask(){
        this.task = {
            title:'',
            note:'',
            date:'',
            note_completed:'',
            is_completed:false,
            provider:this._configService.account,
            provider_id:this._configService.account.id,
            patient_id:null
        }
    }

}

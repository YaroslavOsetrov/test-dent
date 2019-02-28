import { Component, OnInit, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import {FormBuilder, FormGroup} from '@angular/forms';

import {TranslateService} from '@ngx-translate/core';

import {ConfigService} from './../../common/services/config';

import {UserModel} from './../../common/models/user/main';

import {PatientModel} from './../../common/models/user/patient/main';

import {PatientService} from './../patients.service';

@Component({
    selector: 'share-modal',
    templateUrl: 'component.html',
    exportAs:'shareModal'
})
export class ShareModalComponent implements OnInit {

    @ViewChild('shareModal') shareModal;

    users:Array<UserModel> = [];

    selectedIds:Array<string> = [];

    patientId:string;

    patient:PatientModel;

    isSaving = false;

    isLoaded = false;

    constructor(private configService:ConfigService, private patientService:PatientService){

        this.users = this.configService.users;

    }

    ngOnInit(){

       this.patientId = this.patientService.patientId$.getValue();

       if (this.patientId){
           this.loadData(this.patientId)
       }

    }

    private loadData(patientId){
        
        this.isLoaded = false;
        this.patientService.getById(patientId).subscribe(
            response => {
                this.patient = response;
                this.selectedIds.push(this.patient.create_user_id);
            }
        )

        this.patientService.getAccess(patientId).subscribe(
            response => {
                response.forEach((row) => {
                    if (this.selectedIds.indexOf(row.user_id) === -1)
                        this.selectedIds.push(row.user_id);
                });
                this.isLoaded = true;
            }
        )
    }

    show(patientId?){

        if (patientId){
            this.loadData(patientId);
            this.patientId = patientId;
        }
        
        this.shareModal.show();

    }

    toggleUser(userId){

        let index = this.selectedIds.indexOf(userId);

        if (index === -1){
            this.selectedIds.push(userId);
        }else{
            this.selectedIds.splice(index, 1);
        }

    }

    save(){
        
        this.isSaving = true;

        this.patientService.sharePatient(this.patientId, this.selectedIds).subscribe(
            response => {
                this.isSaving = false;
            }
        );

    }

}
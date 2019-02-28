import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';

import {ConfigService} from './../../../../common/services/config';

import {PatientService} from './../../../patients.service';

import {OrganizationService} from './../../../../settings/organization/service';

import {FilesService} from './../../practice/storage/service';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {SweetAlertService} from '@common/services/sweetalert';

@Component({
    selector: 'documents',
    templateUrl: 'component.html'
})
export class DocumentsComponent implements OnInit {

    documents = [];

    patientId:any;

    constructor(private _swalService:SweetAlertService, private _patientService:PatientService, private translateService:TranslateService, private _organizationService:OrganizationService, private _filesService:FilesService){

    }

    ngOnInit(){

        this.patientId = this._patientService.patientId$.getValue();

        this._organizationService.getDocuments().subscribe(
            response =>{
                this.documents = response;
            }
        )

    }

    onDocumentAdded(document){

        let isNew = true;

        this.documents.forEach((row, i) => {
            if (row['id'] == document['id']){
                this.documents[i] = document;
                isNew = false;
            }
               
        })
        if (isNew)
            this.documents.unshift(document);
    }
}
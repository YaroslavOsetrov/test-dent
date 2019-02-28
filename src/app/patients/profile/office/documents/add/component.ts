import { Component, OnInit, AfterViewInit, OnChanges, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';

import {FormBuilder, FormGroup} from '@angular/forms';
import { KeyValueChanges, KeyValueDiffer, KeyValueDiffers } from '@angular/core';

import {TranslateService} from '@ngx-translate/core';

import {Subject} from 'rxjs';

import * as tagsList from './tags.json';


import {PatientService} from './../../../../patients.service';
import {OrganizationService} from './../../../../../settings/organization/service';

import {FilesService} from './../../../practice/storage/service';

import {SweetAlertService} from '@common/services/sweetalert';

declare var MediumEditorTable:any;

@Component({
    selector: 'addDocument-modal',
    templateUrl: 'component.html',
    exportAs:'addDocumentModal'
})
export class AddDocumentModalComponent implements OnInit {

    @ViewChild('addDocumentModal') addDocumentModal;

    @Output('documentAdded') documentAdded:EventEmitter<any> = new EventEmitter<any>();

    isSaving = false;

    update$: Subject<any> = new Subject();

    document:{id:string, title:string, text:string} = {
        title:'',
        text:'',
        id:''
    };

    tagsList = tagsList;

    patientId:any;

    mediumOptions = {
        toolbar: {
            buttons: ['bold', 'italic', 'underline', 'h1', 'h2', 'h3', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'table']
        },
        extensions:{
            table: (new MediumEditorTable() as any)
        }
    }

    toggleTags = false;

    private documentDiffer: KeyValueDiffer<string, any>;

    constructor(private _patientService:PatientService, 
                private el:ElementRef,
                private translateService:TranslateService,
                private _filesService:FilesService,
                private _swalService:SweetAlertService,
                private differs: KeyValueDiffers,
                private _organizationService:OrganizationService){
    }

    ngOnInit(){

        this.patientId = this._patientService.patientId$.getValue();

        this.documentDiffer = this.differs.find(this.document).create();
    }

    ngAfterViewInit(){
        if (document){
            let nodes = document.getElementsByClassName('medium-editor-toolbar-actions') as HTMLCollectionOf<HTMLElement>;
            let node:any = nodes[0];
            if (node)
                node.style.display = 'none';
        }
    }
   
    cancel(){
        this.addDocumentModal.hide();
    }

    generate(){

        this._swalService.loader({
            title:'patient.print.title',
            text: 'patient.print.descr'
        }, this._filesService.printDocument(this.patientId, this.document['id'], {filename:this.document['title']}), (response) => {

            this._swalService.download({
                title:'patient.doc.ready.title',
                text:'patient.doc.ready.descr'
            }, {
                url:response['filename']
            })
 
        });

    }

    save(){

        if (!this.document.title || !this.document.text)
            return false;

        this.isSaving = true;

        if (!this.document.id){
             
             this._organizationService.createDocument(this.document).subscribe(
                response => {
                    this.isSaving = false;
                    this.addDocumentModal.hide();
                    this.documentAdded.emit(response);
                }
            )
        } 
        else
            this._organizationService.saveDocument(this.document.id, this.document).subscribe(
                response => {
                    this.isSaving = false;
                    this.addDocumentModal.hide();
                    this.documentAdded.emit(this.document);
                }
            )

    }

    show(document?){

        this.addDocumentModal.show();

        if (document){
            this.document = {
                title:document.title,
                text:document.text,
                id:document.id
            }
            let node = this.el.nativeElement.querySelector('#ng-trumbowyg');
            node.innerHTML = this.document.text;
        }else{
            this.document.id = null;
            this.document.title = '';
            this.document.text = '...'
        }
        
    }

    ngDoCheck(): void {
        let changes = this.documentDiffer.diff(this.document);
        if (changes){
            if (document){
                let nodes = document.getElementsByClassName('medium-editor-toolbar-actions') as HTMLCollectionOf<HTMLElement>;
                let node:any = nodes[0];
                if (node)
                    node.style.display = 'none';
            }
            
        }
       
    }
}
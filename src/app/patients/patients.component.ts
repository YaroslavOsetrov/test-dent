import { Component, OnInit, Renderer2 } from '@angular/core';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {PatientService} from './patients.service';

import {ConfigService} from './../common/services/config';

import {TranslateService} from '@ngx-translate/core';

import {PatientModel} from './../common/models/user/patient/main';

const pageLimit = 100;

import {SweetAlertService} from '@common/services/sweetalert';

@Component({
    selector: 'patients',
    templateUrl: 'patients.html'
})
export class PatientsComponent implements OnInit {
 
    searchOptions = {
        page:0,
        isSearching:false,
        isSearchingMore:false,
        isDefaultPatients:true,
        sort: {field:'create_date', type:'desc'},
        search:'',
        isSorting:false,
        isSearchEnd:false,
        patientsGroup:'active'
    };

    
    activatedRowIndex:number = null;

    patients:Array<PatientModel>=[];

    APPSETTINGS:any;

    isOpen:{add:boolean, group:boolean} = {
        add:false,
        group:false
    };

    searchTypingTimer:any;

    searchPatient:FormGroup;

    localeFormat:any;

    account:any;

    calendarSettings:any;

    toggledIds = [];

    patientStats:any;

    patientGroups = ['active', 'primary', 'debts', 'archived'];
    
   
    constructor(private fb:FormBuilder, 
                private _swalService:SweetAlertService,
                private patientService:PatientService, 
                private translateService:TranslateService,
                private configService:ConfigService,
                private rendered:Renderer2
                ) {
        
        this.calendarSettings = this.configService.scheduler;
        
        this.APPSETTINGS = this.configService.defaults;

        this.searchPatient = this.fb.group({
            key:  [''],
        });

        this.account = this.configService.account;

        this.localeFormat = this.configService.country.locale_format;

    }

    disableBut(name){

        this.isOpen = {
            add:false,
            group:false
        };

        this.isOpen[name] =  true;
       
    }

    toggleMenu(patientId){

        let index = this.toggledIds.indexOf(patientId);

        if (index === -1){
            this.toggledIds.push(patientId);
        }else{
            this.toggledIds.splice(index, 1);
        }

    }

    onPatientAdded(event){

        this.disableBut('undef');

        event.patient.is_new = true;

        event.patient.patient_appointments = [];

        this.patients.unshift(event.patient);

    }

    delete(patient){
       this._swalService.confirm({
            title:'patient.archived.confirm.title',
            text: 'patient.archived.confirm.descr'
        }).then((confirmed) => {
        
            this._swalService.message({
                title:'patient.archived.title',
                text:'patient.archived.descr',
                type:'success'
            })
            
            patient.is_archived = true;
            this.patientService.save(patient.id, patient).subscribe();
        });

    }

    resetSearch(event){

        let key = event.target.value.replace('/', '').replace('"', '').replace("'", '').replace(' ', '');
       
        if (key.length == 0 && !this.searchOptions.isDefaultPatients){
            this.searchOptions.isDefaultPatients = true;
            this.searchOptions.search = '';
            this.loadPatients(this.searchOptions);
        }  
    }

    performSearch(event){

        let key = event.target.value.replace('/', '').replace('"', '').replace("'", '').replace(' ', '');

        this.searchOptions.page = 0;
        if (key.length > 0){

            clearTimeout(this.searchTypingTimer);

            this.searchTypingTimer = setTimeout(() => {

                if (event.target.value.length > 0){
                     this.searchOptions.isDefaultPatients = false;
               
                    this.searchOptions.search = key;
                    this.searchOptions.isSearching = true;
                    this.loadPatients(this.searchOptions);
                }

            }, 1000);

        }else{
            this.searchOptions.isDefaultPatients = true;
            this.searchOptions.search = '';
            this.loadPatients(this.searchOptions);
        }
             

    }


    applyGroup(group){

        this.searchOptions.patientsGroup = group;

        
        this.searchOptions.isSorting = true;
        this.searchOptions.isSearchEnd = false;

        this.loadPatients(this.searchOptions);

    }

    applySort(field){

        if (this.searchOptions.sort.field == field){
            
            this.searchOptions.sort.type = (this.searchOptions.sort.type == 'desc') ? 'asc' : 'desc';

        }else{
            this.searchOptions.sort.field = field;
            this.searchOptions.sort.type = 'desc';
            
        }
        this.searchOptions.isSearchEnd = false;
        this.searchOptions.isSorting = true;
        this.loadPatients(this.searchOptions);

    }

    loadMore(){

        this.searchOptions.page += 1;

        this.loadMorePatients(this.searchOptions);

    }

    ngOnInit() {

        this.loadPatients(this.searchOptions);

        this.patientService.getStats().subscribe(
            response => {
                this.patientStats = response;
            }
        )
    }

     ngAfterViewInit(){

         this.rendered.listen('document', 'scroll', (event) => {
            
            let element = event.target.body;
            if (element.scrollHeight - element.scrollTop === element.clientHeight)
            {
                this.loadMore();
            }
        });
    }

    private loadPatients(opts):void{
        
        if (this.patients.length == 0)
            this.searchOptions.isSearching = true;

        this.activatedRowIndex = null;
        
        this.searchOptions.isSearchEnd = false;
        
        this.searchOptions.page = 0;

        this.patientService.get(this.searchOptions.patientsGroup, opts.page, opts.sort.field + '=' + opts.sort.type, opts.search).subscribe(
            response => {

                this.searchOptions.isSearchEnd = (response.length < pageLimit);

                this.searchOptions.isSearching = false;
                this.searchOptions.isSorting = false;
                
                this.patients = response;
            }
        );

    }

    private loadMorePatients(opts):void{
        this.activatedRowIndex = null;

        if (!this.searchOptions.isSearchEnd){
            this.searchOptions.isSearchingMore = true;
            this.patientService.get(this.searchOptions.patientsGroup, opts.page, opts.sort.field + '=' + opts.sort.type, opts.search).subscribe(
                response => {

                    this.searchOptions.isSearchEnd = (response.length < pageLimit);

                    this.searchOptions.isSearchingMore = false;
                    this.patients = this.patients.concat(response);
                }
            );
        }
        
    }
    
}

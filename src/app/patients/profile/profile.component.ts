import { Component, OnInit } from '@angular/core';

import {ActivatedRoute, Router} from '@angular/router';

import {PatientService} from './../patients.service';

import {PatientModel} from './../../common/models/user/patient/main';

import {ConfigService} from './../../common/services/config';

import {TranslateService} from '@ngx-translate/core';

import {SweetAlertService} from '@common/services/sweetalert';

import html2canvas from 'html2canvas';


@Component({
    selector: 'profile',
    templateUrl: 'profile.html'
})

export class ProfileComponent implements OnInit {
 
    patient:PatientModel;

    APPSETTINGS:any;
    
    isLoaded = false;
    
    account:any;
   
    constructor(private route: ActivatedRoute, 
                private translateService:TranslateService,
                private configService:ConfigService,
                private _swalService:SweetAlertService,
                private patientService:PatientService) {

        this.APPSETTINGS = this.configService.defaults;

        this.account = this.configService.users[0];
        
    }

    ngOnInit() {

        this.route.params.subscribe(params => {
            
            this.patientService.setPatientId(params['id'].toUpperCase());

            this.patientService.getById(params['id'].toUpperCase()).subscribe(
                response => {
                    
                    this.isLoaded = true;

                    this.patient = response;

                    this.patientService.setPatient(this.patient);

                    mixpanel.track("patientOpen", {patientId:this.patient['id']});
                }
            )
        });
    }

    print(){

        html2canvas(document.getElementsByClassName('patient-treatment')[0]).then(
            (canvas) => {
                // canvas is the final rendered <canvas> element
                let myImage = canvas.toDataURL("image/png");
            }
        );

        this._swalService.loader({
            title:'patient.charting.print.title',
            text: 'patient.charting.print.descr'
        }, this.patientService.printHistory(this.patient.id), (response) => {

            this._swalService.download({
                title:'patient.doc.ready.title',
                text:'patient.doc.ready.descr'
            }, {
                url:response['filename']
            })
        });
    }

    delete(){

        this._swalService.confirm({
            title:'patient.archived.confirm.title',
            text:'patient.archived.confirm.descr'
        }).then(
            confirmed => {
                this.patient.is_archived = true;
                this.patientService.save(this.patient.id, this.patient).subscribe();
            }
        )
    }

    restore(){
        this.patient.is_archived = false;
        this.patientService.save(this.patient.id, this.patient).subscribe();

    }
}

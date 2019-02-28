import {Component, OnInit, OnChanges, Output, EventEmitter, Input, ViewChild} from '@angular/core';

import {ConfigService} from './../../../../../common/services/config';

import {PatientService} from './../../../../patients.service';

import {PatientProcedureModel} from './../../../../../common/models/user/patient/procedure';

import {ICD10Service} from './../../../../patients.service';

import {TranslateService} from '@ngx-translate/core';

import {ModalStateService} from '@common/services/global';

@Component({
    selector: 'add-diagnosis',
    templateUrl:'index.html'
})
export class AddDiagnosisComponent implements OnChanges, OnInit{

    @Input('selectedTeeth') selectedTeeth:any;
    @Input('plan') plan:any;

    expanded = [];

    codes:any;

    patient:any;

    constructor(private _modalState:ModalStateService, private _patientService:PatientService, private _translateService:TranslateService, private _ICD10Service:ICD10Service){

    }

    ngOnInit(){
        this._ICD10Service.getCodes(this._translateService.currentLang).subscribe(
            response => {
                this.codes = response;
            }
        )

        this._patientService.patient$.subscribe(
            response => {
                this.patient = response;
            }
        )
    }

    ngOnChanges(){

    }
    
    selectDiagnosis(diagnosis){
      
        this.selectedTeeth.forEach((tooth) => {

            if (!this.plan.dental_chart.hasOwnProperty(tooth)){
                this.plan.dental_chart[tooth]={};
            }


            let currentChart = Object.assign({}, this.plan.dental_chart);

            currentChart[tooth]['diagnosis'] = diagnosis.code;

            this.plan.dental_chart = currentChart;

            mixpanel.track("patientChartingDiagnosisAdded");

            if (this.plan['is_default']){
                this.patient.dental_chart = this.plan.dental_chart;
                this._patientService.save(this.patient.id, this.patient).subscribe();
            }else{
                this._patientService.savePlan(this.patient.id, this.plan['id'], this.plan).subscribe();
            }
        })           
    }
}
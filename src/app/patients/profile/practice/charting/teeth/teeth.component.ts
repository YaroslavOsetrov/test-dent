import {Component, ElementRef, SimpleChanges, EventEmitter, Output, Input, ViewChild, OnChanges, OnInit} from '@angular/core';

import {AccountService} from '@settings/account/service';

import {ConfigService} from '@common/services/config';

import {PatientService} from '@patients/patients.service';

import {TranslateService} from '@ngx-translate/core';

import {ICD10Service} from './../../../../patients.service';

@Component({
    selector: 'teeth',
    templateUrl:'teeth.html'
})
export class TeethComponent implements OnChanges {


    @Output('teethSelected') teethSelected:EventEmitter<any> = new EventEmitter<any>();


    @Input() 
    set updateSelectedTeeth(value){
        this.selectedTeeth = value;
    }
    

    @Input('uniNotation') uniNotation:any;

    @Output('uniNotationSelected') uniNotationSelected = new EventEmitter<any>();

    @Input ('selectedTeeth') selectedTeeth = [];

    @Input('plan') plan:any;

    @Input() toothId: number;

    @Input() treatmentPlanId:string;

    @Input() isChild:boolean;

    @Input() chartedStatus:string;

    @Input() selectedTreatment:any;

    _scProc: string;
    get scProc(): string {
        return this._scProc;
    }

    @Input('scale')
    set scProc(value: string) {

        this._scProc = 'scale('+value+')';
    }

    @Input()
    selectedTreatmentDetails:any;



    @Input()
    set newTeethProcedures(procedures){

    }

    diagnoses = [];

    codesObj:any = {};

    patient:any;


    @Input('dentalChart') dentalChart;
  /*  set dentalChart(chart){
        console.log(chart);
      /*  console.log(chart);
        if (chart != null){
            this.chartedTreatment = chart;
        }*/

   // }
    
    chartedTreatment;



//    @Output() procedureSelected: EventEmitter<boolean> = new EventEmitter<boolean>();

 //   @ViewChild('selectProcedure') public selectProcedure;


    constructor(private _patientService:PatientService, private _translateService:TranslateService, private _ICD10Service:ICD10Service, private _accountService:AccountService, private _configService:ConfigService){

        this.chartedTreatment = {};

        this._ICD10Service.getCodes(this._translateService.currentLang).subscribe(
            response => {
                response.forEach((row) => {
                    row['codes'].forEach((row) => {
                        this.codesObj[row['code']] = row['title'];
                    })
                })
            }
        )

        this._patientService.patient$.subscribe(
            response => {
                this.patient = response;
            }
        )
    }
    
    miss(){

        if (typeof this.dentalChart === 'string')
            this.dentalChart = JSON.parse(this.dentalChart);

        this.selectedTeeth.forEach((tooth) => {

            if (!this.dentalChart[tooth])
                this.dentalChart[tooth] = {};
            this.dentalChart[tooth]['miss'] = true;
        })

        this.updateChart();

        this.selectedTeeth = [];

    }

    clear(){

        this.selectedTeeth.forEach((tooth) => {
            this.dentalChart[tooth] = {};

            this.diagnoses = this.diagnoses.filter((row, i) => {
                return (row['toothId'] != tooth);
            })
        })

        this.updateChart();
        
    }

    updateChart(){

        this.chartedTreatment = this.dentalChart;

        if (!this.plan['id']){
            this.patient.dental_chart = this.plan['dental_chart'];
            this._patientService.save(this.patient.id, this.patient).subscribe();
        }else{
            this._patientService.savePlan(this.patient.id, this.plan.id, this.plan).subscribe();
        }
    }



    ngOnChanges(changes:SimpleChanges){

        if (changes.hasOwnProperty('dentalChart')){
            this.diagnoses = [];
            
            this.selectedTeeth = [];
            if (changes.dentalChart.currentValue instanceof Object){
                this.chartedTreatment = changes.dentalChart.currentValue;
            }
            if (typeof changes.dentalChart.currentValue === 'string'){
                this.chartedTreatment = JSON.parse(changes.dentalChart.currentValue);
            }

            for (let key in this.chartedTreatment){

                if (this.chartedTreatment[key].hasOwnProperty('diagnosis')){
                    this.diagnoses.push({
                        toothId:key,
                        diagnosis:this.chartedTreatment[key]['diagnosis']
                    })/*
                    if (!this.diagnoses[key])
                        this.diagnoses[key] = [];
                    
                    if (this.diagnoses[key].indexOf(this.chartedTreatment[key]['diagnosis']) == -1)
                        this.diagnoses[key].push(this.chartedTreatment[key]['diagnosis']);*/
                }
            }
        }
       
        
    }

    selectTooth(toothId){

        let index = this.selectedTeeth.indexOf(toothId.toString());

        if (index == -1){
            this.selectedTeeth.push(toothId.toString());
        }else{
            this.selectedTeeth.splice(index, 1);
        }

        this.teethSelected.emit(this.selectedTeeth);

    }

    uniNotationSwitch(){
        this.uniNotation = !this.uniNotation; 
        this.uniNotationSelected.emit(this.uniNotation);

        let account = this._configService.account;

        account.is_uni_teeth_scheme = this.uniNotation;
        this._configService.account = account;

        this._accountService.save(account).subscribe();

        location.reload();
    }

    updateIntact(){

    }

    isSelected(toothId){
        return this.selectedTeeth.indexOf(toothId.toString()) !== -1;
    }

    chartTreatment(toothId){
/*
        let treatment = this.selectedTreatment;

        if (treatment.hasOwnProperty('plan'))
        if (treatment['plan']['status'] != 2)
            return false;

        this.selectedTreatment['toothId'] = toothId;

        if (!(toothId in this.chartedTreatment)){
            this.chartedTreatment[toothId] = {};
        }

        if (this.selectedTreatment['type'] == 'diagnosis'){

            let diagnosis = this.selectedTreatment['diagnosis']['code'];

            if (diagnosis == 'N'){
                diagnosis = null;
            }

            this.chartedTreatment[toothId]['diagnosis'] = diagnosis;

            this.procedureSelected.emit(true);

            return false;
        }


        if (treatment['procedure']['code'] == 'rootcanal'){
            this.chartedTreatment[toothId].rootcanal=treatment.status.code;
        }

        if (treatment['procedure']['code'] == 'rootcanal-postcore'){
            this.chartedTreatment[toothId].rootcanal=treatment.status.code;
            this.chartedTreatment[toothId].postcore=treatment.status.code;
        }

        if (treatment['procedure']['code'] == 'sealant'){
            this.chartedTreatment[toothId].sealant=treatment.status.code;
        }

        if (treatment['procedure']['code'] == 'veneer'){
            this.chartedTreatment[toothId].veneer=treatment.status.code;
        }

        if (treatment['procedure']['code'] == 'implant'){
            this.chartedTreatment[toothId].implant=treatment.status.code;
        }

        if (treatment['procedure']['code'].indexOf('crown') != -1){
            this.chartedTreatment[toothId].crown=treatment.crownMaterial.code;
            this.chartedTreatment[toothId].crownStatus=treatment.status.code;
        }

        if (treatment['procedure']['code'] == 'crown34'){
            this.chartedTreatment[toothId].crown34 = 'true';
        }

        if (treatment['procedure']['code'] == 'extraction'){
            this.chartedTreatment[toothId].extraction = 'treatment';
        }

        if (treatment['procedure']['code'] == 'bridge-pontic-metal'){

            this.chartedTreatment[toothId].missing = 'root';
            delete this.chartedTreatment[toothId]['crown34'];
            this.chartedTreatment[toothId].crown=treatment.crownMaterial.code;
            this.chartedTreatment[toothId].crownStatus=treatment.status.code;
            this.chartedTreatment[toothId].retainer=treatment.status.code;
        }

        if (treatment['procedure']['code'] == 'bridge-retainer-metal'){

            this.chartedTreatment[toothId].retainer=treatment.status.code;
            delete this.chartedTreatment[toothId]['crown34'];
            delete this.chartedTreatment[toothId]['missing'];
            this.chartedTreatment[toothId].crown=treatment.crownMaterial.code;
            this.chartedTreatment[toothId].crownStatus=treatment.status.code;

        }

        if (treatment['procedure']['code'] == 'intact'){
            this.chartedTreatment[toothId] = {};

            this.procedureSelected.emit(true);

            return false;
        }

        if (treatment['procedure']['code'] == 'missing'){
            this.chartedTreatment[toothId] = {
                missing:'all'
            };

            this.procedureSelected.emit(true);

            return false;
        }

        this.selectProcedure.show(toothId);
*/

    }

    onProcedureSelected(event){

    //    this.procedureSelected.emit(event);
    }
}

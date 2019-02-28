import { Component, ChangeDetectorRef, OnInit, AfterContentInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';

import {PatientService} from './../../../patients.service';

import {ConfigService} from './../../../../common/services/config';

import {ProceduresComponent} from './procedures/component';
import {PlansListComponent} from './plansList/component';

@Component({
    selector: 'charting',
    templateUrl: 'component.html'
})
export class ChartingComponent implements OnInit {

    @Output('defaultPlanLoaded') defaultPlanLoaded = new EventEmitter<any>();

    @Output('defaultChartLoaded') defaultChartLoaded = new EventEmitter<any>();

    uniNotation = false;

    @ViewChild('proceduresList') proceduresList:any;

    @ViewChild('proceduresComponent') proceduresComponent:ProceduresComponent;
    @ViewChild('plansListComponent') plansListComponent:PlansListComponent;

    selectedTeeth = [];

    selectedPlan:any = {
        dental_chart:{},
        procedures:[],
        id:null,
        status:0,
        is_default:false
    };

    defaultPlan:any = {
        dental_chart:{},
        procedures:[],
        is_default:true,
        id:null
    };

    treatmentPlans = [];

    @Input('patient') patient:any;

    openedTab = null;
    
    isLoaded = {
        dental_chart:false,
        procedures:false,
        plans:false
    };

    unscheduledProcedures = [];

    is_child = false;

    flag = false;

    constructor(private cdRef:ChangeDetectorRef, private _patientService:PatientService, private _configService:ConfigService){

        this.uniNotation = this._configService.account.is_uni_teeth_scheme;

    }

    initialize(defaultDentalChart){
        if (this.selectedPlan.is_default){
            this.selectedPlan.dental_chart = defaultDentalChart;
        }
    }

    trackDD(name){
        mixpanel.track("patientChartingDropdown", {dropdown:name});
    }

    ngOnInit(){
        
        if (this.patient){
            this._patientService.setPatient(this.patient);
            this._patientService.setPatientId(this.patient['id']);
        }

        let patientId = this._patientService.patientId$.getValue();

        this._patientService.getPlans(patientId).subscribe(
            response => {
                response.forEach((row) => {
                    try{
                        row['dental_chart'] = JSON.parse(row['dental_chart']);
                    }catch(e){
                        row['dental_chart'] = {};
                    }
                    
                    row['procedures'] = null;
                });

                response = response.sort((a, b) => {
                    return (a.status != 1);
                })
                this.treatmentPlans = response;
                this.isLoaded.plans = true;
            }
        );
       
        this._patientService.patient$.subscribe(
            patient => {
                if (patient.hasOwnProperty('dental_chart')){
                    this.patient = patient;
                    this.is_child = this.patient['is_child'];
                    this.isLoaded.dental_chart = true;
                    try{
                        this.defaultPlan.dental_chart = JSON.parse(patient['dental_chart']);
                    }catch(e){
                        this.defaultPlan.dental_chart = {};
                    }
                   
                   this.defaultChartLoaded.emit(this.defaultPlan.dental_chart);
                }
                
            }
        );

        this._patientService.getUnschedProcedure(patientId).subscribe(
            response => {
                let unscheduledSection = {
                    appointment_procedures:response,
                    plan_id:null,
                    date:null,
                    is_unscheduled:true,
                    appointment_id:null,
                    appointment_index:0,
                    procedures:response
                };
                this.defaultPlan.procedures.unshift(unscheduledSection);
            }
        )
        
        this._patientService.getProcedure(patientId, 0).subscribe(
            response => {
                
                this.isLoaded.procedures = true;
                this.defaultPlan.procedures = this.defaultPlan.procedures.concat(response);

                this.defaultPlanLoaded.emit(response);

                

                this.selectPlan(null, true);
            }
        );


    }

    selectPlan(plan, init?){

        this.selectedTeeth = [];

        if (this.proceduresComponent)
        this.proceduresComponent.selectedProcedures = {};

        if (plan == null)
            this.selectedPlan = this.defaultPlan;
        else {
            if (!plan.procedures){
                this.isLoaded.procedures = false;

                this.treatmentPlans.forEach((row, i) => {
                    if (row['id'] == plan['id']){
                        this.selectedPlan = row;
                    }
                });

                this._patientService.getPlanProcedures(this.patient.id, plan['id']).subscribe(
                    response => {
                        this.treatmentPlans.forEach((row, i) => {
                            if (row['id'] == plan['id']){
                                row['procedures'] = [];
                                response.forEach((procedure) => {
                                    if (!row['procedures'][procedure['appointment_index']]){
                                        row['procedures'][procedure['appointment_index']] = {
                                            appointment_procedures:[],
                                            appointment_procedures_sum:0
                                        };
                                    }
                                    row['procedures'][procedure['appointment_index']].appointment_procedures_sum += procedure.price_fee_adj * procedure.qty;
                                    row['procedures'][procedure['appointment_index']].appointment_procedures.push(procedure);
                                });
                                this.selectedPlan = row;
                            }
                        });
                        this.isLoaded.procedures = true;
                        
                    }
                )   
            }
            else
                this.selectedPlan = plan;
        }
              
    }
    
    updatePlanStatus(newStatus){

        this.selectedPlan['status'] = newStatus;

        for (let tooth in this.selectedPlan.dental_chart){

            for (let diagnosis in this.selectedPlan.dental_chart[tooth]){
                if (!this.defaultPlan.dental_chart.hasOwnProperty(tooth)){
                    this.defaultPlan.dental_chart[tooth] = {};
                }
                this.defaultPlan.dental_chart[tooth][diagnosis] = this.selectedPlan.dental_chart[tooth][diagnosis];
            }
        }
        this.patient.dental_chart = this.defaultPlan.dental_chart;
        this.savePatient();

        this._patientService.savePlan(this.patient.id, this.selectedPlan.id, this.selectedPlan).subscribe();

    }

    savePatient(){
        this._patientService.save(this.patient['id'], this.patient).subscribe();
    }
}
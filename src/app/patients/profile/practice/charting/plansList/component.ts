import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';

import {TranslateService} from '@ngx-translate/core';

import {SweetAlertService} from '@common/services/sweetalert';
import {PatientService} from '@patients/patients.service';

@Component({
    selector: 'plans-list',
    templateUrl:'index.html'
})
export class PlansListComponent implements OnInit{
    
    @Output('planSelected') planSelected = new EventEmitter<any>();

    @Input() plans = [];

    patientId:any;

    constructor(private _swalService:SweetAlertService, 
                private translateService:TranslateService,
                private _patientService:PatientService){

    }

    ngOnInit(){
        this.patientId = this._patientService.patientId$.getValue();
    }

    getCompletedPercent(plan){

        if (plan.total_procedures == 0 || plan.completed_procedures == 0)
            return 2;
        else 
            return plan.completed_procedures*100/plan.total_procedures;
    }

    print(planId){

        this._swalService.loader({
            title:'patient.charting.print.title',
            text: 'patient.charting.print.descr'
        }, this._patientService.printPlan(this.patientId, planId), (response) => {

            this._swalService.download({
                title:'patient.doc.ready.title',
                text:'patient.doc.ready.descr'
            }, {
                url:response['filename']
            })
        });
    }

    delete(planId){
        this._swalService.confirm({
             title:'patient.charting.plan.delete.title', 
             text:'patient.charting.plan.delete.descr'
        }).then(
            completed => {
                this._patientService.deletePlan(this.patientId, planId).subscribe();

                this.plans = this.plans.filter((row) => {
                    return row['id'] != planId;
                })
            }
        )
    }

    onPlanAdded(plan){
        plan['dental_chart'] = {};
        plan['procedures'] = [];
        this.planSelected.emit(plan);
    }

    getCompletedProcedures(plan){

        let completed_procedures = 0;
        if (plan.procedures){
            plan.procedures.forEach((section) => {
                section.appointment_procedures.forEach((row) => {
                    if (row['status_code'] == 'c')
                        completed_procedures += 1;
                })
            })
        }

        return (plan.completed_procedures > completed_procedures)? plan.completed_procedures : completed_procedures;
    }
}
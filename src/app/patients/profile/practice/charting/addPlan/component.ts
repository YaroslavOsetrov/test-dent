import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';

import {TranslateService} from '@ngx-translate/core';

import {SweetAlertService} from '@common/services/sweetalert';
import {PatientService} from './../../../../patients.service';

@Component({
    selector: 'add-plan',
    templateUrl:'index.html'
})
export class AddPlanComponent implements OnInit{


    @Input() plans = [];
    @Output('planAdded') planAdded = new EventEmitter<any>();

    newPlanName = '';

    patientId:any;
    constructor(private _swalService:SweetAlertService, 
                private _patientService:PatientService){

    }


    ngOnInit(){
        this.patientId = this._patientService.patientId$.getValue();
    }


    submit(){
        if (!this.newPlanName)
            return;

        let plan = {
            name:this.newPlanName
        };

        mixpanel.track("patientChartingPlanAdded", {name:this.newPlanName});

        this._patientService.addPlan(this.patientId, plan).subscribe(
            response => {

                this.newPlanName = '';
                this.plans.push(response);
                this.planAdded.emit(response);
            }
        )
    }
}
  
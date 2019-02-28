import { Component, OnInit, ViewChild, Input } from '@angular/core';

import {PatientService} from './../../patients.service';

@Component({
    selector: 'practice',
    templateUrl: 'component.html'
})
export class PracticeComponent implements OnInit {
    

    loadedTabs = {
        'charting':true,
        'notes':false,
        'billing':false,
        'storage':false
    };

    defaultPlan:any;

    @Input('patient') patient:any;

    constructor(private _patientService:PatientService){

    }

    ngOnInit(){

        if (this.patient){
            this._patientService.setPatient(this.patient);
            this._patientService.setPatientId(this.patient['id']);
        }else
        this._patientService.patient$.subscribe(
            response => {
                if (response)
                    if (response.hasOwnProperty('balance'))
                        this.patient = response;
            }
        )
    }

    trackTab(tabName){

        mixpanel.track("patientOpenTab", {tab:tabName});

    }

}
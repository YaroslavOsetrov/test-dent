import { Component, OnInit, ViewChild, Output, Input, EventEmitter } from '@angular/core';

import {FormBuilder, FormGroup} from '@angular/forms';

import {ValidationService} from './../../common/modules/validation';

import {AppointmentModel} from './../../common/models/appointment/main';

import {ConfigService} from './../../common/services/config';

import * as moment from 'moment';

import {AppointmentService} from './../calendar.service';

import {PatientService} from './../../patients/patients.service';

@Component({
    selector: 'note',
    templateUrl: 'note.html'
})
export class NoteComponent implements OnInit {


    @Input('appt') appt:AppointmentModel;

    @Output('noteAdded') noteAdded = new EventEmitter<any>();

    newAppointment:FormGroup;

    isSubmitted = false;

    constructor(private configService:ConfigService, 
                private patientService:PatientService,
                private appointmentService:AppointmentService, private fb:FormBuilder){

        this.newAppointment = this.fb.group({
            note: ['', ValidationService.requiredValidator]
        });

    }

    ngOnInit(){

    }

    submit(){

        if (!this.newAppointment.valid)
            return false;

        let apptData = this.newAppointment.value;

        this.appt.note = apptData.note;
        this.appt.notify_before = true;
        this.appt.notify_create = true;

        this.isSubmitted = true;

        this.appointmentService.addBlank(this.appt).subscribe(
            appt => {
                this.isSubmitted = false;

                this.noteAdded.emit(appt);
            }
        );
    }

}
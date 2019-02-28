import { Component, OnInit, ViewChild, OnChanges, Output, Input, EventEmitter } from '@angular/core';

import {FormBuilder, FormGroup} from '@angular/forms';

import {ValidationService} from './../../common/modules/validation';

import {ConfigService} from './../../common/services/config';

import * as moment from 'moment';

import {Observable} from 'rxjs';

import {CalendarSettings} from './../calendar.model';

import {UserModel} from './../../common/models/user/main';
import {AppointmentModel} from './../../common/models/appointment/main';

import {PatientModel} from './../../common/models/user/patient/main';

import {AppointmentService} from './../calendar.service';

import {PatientService} from './../../patients/patients.service';


@Component({
    selector: 'create-modal',
    templateUrl: 'component.html',
    exportAs:'createModal'
})
export class CreateModalComponent implements OnInit, OnChanges {
    

    @ViewChild('createModal') createModal;

    @Input('defaultPatient') defaultPatient:any;

    @Output('taskCreated') taskCreated = new EventEmitter<any>();

    @Output('appointmentCreated') appointmentCreated:EventEmitter<AppointmentModel> = new EventEmitter<AppointmentModel>();

    providers:Array<UserModel>;

    appt:AppointmentModel;
    
    apptInterval:{start_time:string, end_time:string, date?:any};

    selectedPatient:any;

    schedulerSettings:any;

    isLoading:boolean = false;

    isLoadingDefault = false;

    defaultProviderId:string = '';

    tab = 1;

    private _calendarSections = [];
    get calendarSections(){
        return this._calendarSections;
    }

    @Input('sections') 
    set calendarSections(value:any){
        this._calendarSections = value;
    }

    offices = [];

    selectedOffice:any;
    selectedRoom:any;
    
    constructor(private _configService:ConfigService, 
                private patientService:PatientService,
                private appointmentService:AppointmentService, private fb:FormBuilder){

        

        
    }

    ngOnInit(){

        this.schedulerSettings = this._configService.scheduler;

        this.providers = this._configService.users.filter((row)=>{
            return row.user_roles[0].is_doctor == true;
        });

        this.appt = {
            date: moment().format('YYYY-MM-DD'),
            section_id:1,
            provider:this.providers[0],
            provider_id:this.providers[0].id
        };

        this.offices = this._configService.getProperty('APP_OFFICES');
    }

    ngOnChanges(){

       

    }

    switchSection(index):void{
        this.appt.section_id = index+1;
    }


/*

    onSubmit(){


        if (!this.newAppointment.valid)
            return false;

        if (!this.appt.start_time || !this.appt.end_time || !this.appt.date)
            return false;

        let apptData = this.newAppointment.value;

        this.appt.note = apptData.note;
        this.appt.notify_before = true;
        this.appt.notify_create = true;

        this.isLoading = true;
        if (this.selectedPatient){
            this.appt.patient_id = this.selectedPatient.id;
            
            this.appointmentService.add(this.appt.patient_id, this.appt).subscribe(
                appt => {
                    this.isLoading = false;
                    appt['patient'] = this.selectedPatient;
                    appt['provider'] = this.appt.provider;
                    this.appointmentCreated.emit(appt);
                    this.createModal.hide();

                    this.newAppointment.reset();
                    this.selectedPatient = null;
                }
            );


        }else{

            if (!this.withoutPatient)
                this.patientService.add({fullname:apptData.fullname, phone:apptData.phone}).subscribe(
                    patient => {
                        this.appointmentService.add(patient['id'], this.appt).subscribe(
                            appt => {
                                this.createApptDef(appt, patient);
                            }
                        );
                        
                    }
                )
            else
                this.appointmentService.addBlank(this.appt).subscribe(
                    appt => {
                        this.createApptDef(appt);
                    }
                );
        }

    }

    private createApptDef(appt, patient?){

        this.isLoading = false;
        appt['patient'] = patient;
        appt['provider'] = this.appt.provider;
        this.appointmentCreated.emit(appt);
        
        this.createModal.hide();

        this.selectedPatient = null;
        this.newAppointment.reset();

               
    }

    private addAppt(appt:AppointmentModel){
        
        return Observable.create(observer => {
            this.appointmentService.add(appt.patient_id, appt).subscribe(
                response => {
                    observer.next(response);

                    observer.complete();
                }, 
                errors => {
                    observer.next(errors);

                    observer.complete();
                }
            );
        });
    }*/
    
    show(options?:AppointmentModel, patient?:PatientModel){

        if (options){

            this.selectedOffice = this.offices.find((row) => {
                return (row['id'] == options['office_id']);
            })

            this.selectedRoom = this.selectedOffice['rooms'].find((row) => {
                return (row['id'] == options['room_id']);
            })
            
            Object.assign(this.appt, options);

            let dateUTC = new Date(this.appt.date);

            this.apptInterval = {
                start_time:this.appt.start_time,
                end_time:this.appt.end_time,
                date:new Date(dateUTC.getTime() + dateUTC.getTimezoneOffset() * 60000)
            }

            if (options['provider_id']){
                this.defaultProviderId = options['provider_id'];

                this.providers.forEach((row) => {
                    if (row.id == options['provider_id']){
                        this.appt.provider = row;
                        this.appt.provider_id = row.id;
                    }
                })
            }
        }      

        if (patient){
        //    this.onPatientSelected({is_new:false, patient:patient});
        }
  

        let dayDiff = moment(this.appt.date).weekday() >= this.schedulerSettings.first_day_index ? this.schedulerSettings.first_day_index : this.schedulerSettings.first_day_index - 7;

        let start = moment(this.appt.date).day(dayDiff);

        let end = moment(this.appt.date).day(dayDiff).add(7, 'days');

        this.createModal.show();
    }
}
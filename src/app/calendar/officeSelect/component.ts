import { Component, Input, OnChanges, Output, OnInit, EventEmitter, HostListener, ViewChild } from '@angular/core';

import * as moment from 'moment';

import {SweetAlertService} from '@common/services/sweetalert';

import {ConfigService} from '@common/services/config';

import {TranslateService} from '@ngx-translate/core';

import {CalendarSettingsService, AppointmentService} from './../calendar.service';

import {OrganizationService} from '@settings/organization/service';

@Component({
    selector: 'office-select',
    templateUrl: 'component.html'
})
export class OfficeSelectComponent implements OnInit, OnChanges {

    @Output('officeSelected') officeSelected = new EventEmitter<any>();

    @Input('offices') offices = [];

    selectedOffice = {};

    constructor(private _configService:ConfigService, 
                private _organizationService:OrganizationService,
                private _swalService:SweetAlertService, private calendarSettingsService:CalendarSettingsService, private translateService:TranslateService){

        
    }

    ngOnInit(){
        this.selectedOffice = this.offices[0];
    }

    selectOffice(office){
        this.selectedOffice = office;
        this.officeSelected.emit(office);
    }

    ngOnChanges(){

    }

    

    deleteItem(type, index){

        this._swalService.confirm({
            title:'cal.del_section.title',
            text:'cal.del_section.descr'
        }).then((confirmed) => {

        });

       
    }

    addItem(type){

        let label = 'clinic'
        if (type !='section'){
            label == 'cabinet';
        }

        mixpanel.track("calendarOfficeAdded");

        this._swalService.input({
            title:'cal.'+label+'.add.title',
            text: 'cal.'+label+'.add.descr',
        }).then(name => {

            this._organizationService.addOffice({name:name}).subscribe(
                response => {
                    this.offices.push(response);
                    this._configService.setProperty('APP_OFFICES', this.offices);
                }
            )
        })
    }

}
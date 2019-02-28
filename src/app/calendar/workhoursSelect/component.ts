import { Component, Input, OnChanges, Output, OnInit, EventEmitter, HostListener, ViewChild } from '@angular/core';

import * as moment from 'moment';

import {SweetAlertService} from '@common/services/sweetalert';

import {ConfigService} from '@common/services/config';

import {TranslateService} from '@ngx-translate/core';

import {CalendarSettingsService, AppointmentService} from './../calendar.service';

@Component({
    selector: 'workhours-select',
    templateUrl: 'component.html'
})
export class WorkhoursSelectComponent implements OnInit{


    @Input('fullcalendar') fullCalendar:any;

    @Input('loadedEvents') loadedEvents:any;

    @Output('providerSelected') providerSelected = new EventEmitter<any>();

    isWorkhoursLayout = false;

    selectedProvider:any;

    constructor(private _configService:ConfigService, private _appointmentService:AppointmentService){
        
    }

    onProviderSelected(provider){
        this.selectedProvider = provider;
        this.providerSelected.emit(provider);

        mixpanel.track("calendarWorkhoursStartAdding");
    }

    ngOnInit(){
    }

    exit(){
        this.selectedProvider = null;
    }

    saveAndRender(options){

        this._appointmentService.saveWorkhour({
            start_time:options.start_time,
            end_time:options.end_time,
            section_id:options.section_sub_index,
            section_index:0,
            office_id:options.office_id,
            room_id:options.room_id,
            section_sub_index:options.section_sub_index,
            date:options.date,
            user_id:this.selectedProvider.id
        }).subscribe(
            response => {

                
                let event = {
                    id:response['id'],
                    start:options.date+'T'+options.start_time,
                    end:options.date+'T'+options.end_time,
                    resourceId:options.room_id,
                    rendering: 'background',
                    className:'provider-bg-' + this.selectedProvider.id
                };
                
                this.loadedEvents.push(event);
                this.fullCalendar.addEvents([event]);
            }
        );

    }

}
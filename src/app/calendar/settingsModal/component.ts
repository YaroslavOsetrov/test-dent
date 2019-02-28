import { Component, Output, Input, OnInit, EventEmitter, HostListener, ViewChild } from '@angular/core';

import {ConfigService} from '@common/services/config';

import * as hours from './../../../../public/json/hours.json';

import * as weekdays from './../.../../../../../public/json/weekdays.json';

import {CalendarSettings} from './../calendar.model';

import {OrganizationService} from '@settings/organization/service';

import {Observable, forkJoin} from 'rxjs';

import * as moment from 'moment';


@Component({
    selector: 'settings-modal',
    templateUrl: 'component.html',
    exportAs:'settingsModal'
})
export class SettingsModalComponent implements OnInit {

    @Input('calendarSettings') calendarSettings:CalendarSettings = {
        start_hour:0,
        end_hour:24,
        first_day_index:0,
        sections:[],
        slot_duration:15,
        hidden_days:null
    };

    @ViewChild('settingsModal') settingsModal;

    @Input('office') office:any = {};

    defaultSettings:any = {};

    maxSections = 7;

    hoursList:any;

    @Output('settingsUpdated') settingsUpdated:EventEmitter<CalendarSettings> = new EventEmitter<CalendarSettings>();

    newRoom:string;

    @Input('sectionIndex') section_index:number = 0;

    weekdays:any;

    savingTimer:any;

    range:any;

    hiddenDays = {};
    
    constructor(private _configService:ConfigService, private _organizationService:OrganizationService) {
        
        let configCountry = this._configService.country;

        let hourType = (configCountry.locale_format.is_24h) ? '24h' : '12h';

        this.hoursList = hours[hourType];

        this.weekdays = weekdays['items'];

        this.calendarSettings = this._configService.scheduler;

        this.range = [];
        for (let m = moment('2018-12-09'); m.isSameOrBefore(moment('2018-12-15')); m.add(1, 'days')) {
            this.range.push(m.toDate());
        }

        if (this.calendarSettings.hidden_days)
        this.calendarSettings.hidden_days.split(',').forEach((day)=>{
            this.hiddenDays[Number(day)]=true;
        });
    }

    ngOnInit() {
        
        this.defaultSettings.office = Object.assign({}, this.office);

    }

    show(){

        mixpanel.track("calendarSettingsShow");
        this.settingsModal.show();
    }

    toggleDisplayDay(index){
        this.hiddenDays[index] = true;
    }

    deleteRoom(room):void{
        if (this.office.rooms.length == 1)
            return;

        this.office.rooms.forEach((row, i) => {
            if (row['name'] == room.name){
                if (row['id'])
                    row['is_deleted'] = true;
                else
                    this.office.rooms.splice(i, 1);
            }
        });
    }

    addRoom(){

        if (this.newRoom.trim().length == 0)
            return;

        if (this.office.rooms.length == this.maxSections)
            return;

        let duplicate = this.office.rooms.find((row) => {
            return row['name'] == this.newRoom.trim() && !row['is_deleted'];
        });

        if (duplicate)
            return false;

        let room = {
            name: this.newRoom,
            office_id:this.office.id,
            is_added:true
        };

        this.office.rooms.push(room);
        this.newRoom = '';
    }

    private _updateRoomSettings(){
        let offices = this._configService.getProperty('APP_OFFICES');
        offices.forEach((row) => {
            if (row['id'] == this.office.id)
                row['rooms'] = this.office.rooms;
        })
        this._configService.setProperty('APP_OFFICES', offices);
    }

    save(){

        let addedRooms = this.office.rooms.filter((row, i) => {
            return row['is_added'] == true;
        });

        let deletedRooms = this.office.rooms.filter((row, i) => {
            return row['is_deleted'] == true;
        });      

        let days = [];
        for (let key in this.hiddenDays){
            if (this.hiddenDays[key]) 
                days.push(key);
        }

        this.calendarSettings.hidden_days = days.join(',');

        this.settingsModal.hide();
        forkJoin(
            this._organizationService.addRooms(this.office.id, addedRooms),
            this._organizationService.deleteRooms(this.office.id, deletedRooms)
        ).subscribe(
            response => {
                this.office.rooms = this.office.rooms.filter((row) => {
                    return !row['is_deleted']  && !row['is_added']
                });

                this.office.rooms = this.office.rooms.concat(response[0]);
                
                this.newRoom = '';
                this._updateRoomSettings();
                this.settingsUpdated.emit(this.calendarSettings);
                
            }
        )

        
    }

}
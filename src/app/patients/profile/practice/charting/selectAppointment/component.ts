import {Component, OnInit, OnChanges, Output, EventEmitter, Input, ViewChild} from '@angular/core';

import {ConfigService} from '@common/services/config';

@Component({
    selector: 'select-appointment',
    templateUrl:'index.html'
})
export class SelectAppointmentComponent{

    @ViewChild('addInventoryModal') addInventoryModal:any;

    @Input('appointments') appts:any;

    @Input('dropup') isDropup:boolean = false;

    @Output('appointmentSelected') apptSelected = new EventEmitter<any>();

    procedures = [];

    users = {};

    constructor(private _configService:ConfigService){

        this.users = this._configService.usersObj;

    }

    show(procedures){
        this.addInventoryModal.show();

        this.procedures = procedures;
    }

    selectAppt(index, item){
        this.apptSelected.emit({index:index, id:item.id, appt:item})
    }


    

}
import { Component, OnInit, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import {UserRoleModel} from './../../../common/models/user/user_role';

import {ConfigService} from './../../../common/services/config';

import {CollaborationService} from './../service';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {SweetAlertService} from '@common/services/sweetalert';

@Component({
    selector: 'access-modal',
    templateUrl: 'component.html',
    exportAs:'accessModal'
})
export class AccessModalComponent implements OnInit {

    @ViewChild('accessModal') accessModal;

    @Output('userDeleted') userDeleted:EventEmitter<any> = new EventEmitter<any>();

    userRole:UserRoleModel={};

    profile:any;

    user:any;


    rules = ['online_access', 'patients', 'appointments', 'patient_profile', 'patient_billing', 'patient_treatment', 'settings']

    rulesEnabled = {
        dentist:['is_doctor', 'online_access', 'edit_patient'],
        frontDesk:['online_access', 'view_patient', 'create_patient', 'edit_appt', 'edit_patient', 'delete_patient', 'access_collaboration', 'share_patient', 'access_templates', 'add_task'],
    };

    isLoading = false;

    constructor(private configService:ConfigService, 
                private _swalService:SweetAlertService,
                private translateService:TranslateService,
                private collaborationService:CollaborationService){


    }

    ngOnInit(){

    }

    show(user){
        this.userRole = user.user_roles[0];

        this.user = user;
        this.accessModal.show();

        mixpanel.track("settingsCollaborationEditOpen");
    }

    toggleRole(role){
        this.profile = null;
        this.userRole[role] = !this.userRole[role];
    }

    deleteUser(){

        this._swalService.confirm({
            title:'settings.collaboration.access.close.title',
            text:'settings.collaboration.access.close.descr'
        }).then(
            confirmed => {
                this.userDeleted.emit(this.user);
                this.accessModal.hide();
            }
        )
    }

    save(){

        mixpanel.track("settingsCollaborationEditSave");
        
        let users = this.configService.users;

        users.forEach((row) => {
            if (row.id == this.userRole.user_id){
                row.user_roles[0] = this.userRole;
            }
        });

        this.configService.users = users;

        this.isLoading = true;
        
        this.collaborationService.save(this.userRole.user_id, this.userRole).subscribe(
            response => {
                this.isLoading = false;
            }
        );
    }

}
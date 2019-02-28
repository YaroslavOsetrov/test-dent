import { Component, OnInit } from '@angular/core';

import {CollaborationService} from './service';

import {OrganizationService} from './../organization/service';

import {ConfigService} from './../../common/services/config';

import {UserModel} from './../../common/models/user/main';

import {AccountService} from './../account/service';

import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'collaboration',
    templateUrl: 'component.html'
})
export class CollaborationComponent implements OnInit {

    invitations:Array<any> = [];

    isLoaded = false;

    isOrgLoad = false;

    organization:any;
    
    users:Array<UserModel> = [];
    
    constructor(private organizationService:OrganizationService, 
                private accountService:AccountService,
                private translateService:TranslateService,
                private configService:ConfigService,
                private collaborationService:CollaborationService){
        

        this.users = this.configService.users;
    }

    ngOnInit(){

        mixpanel.track("settingsCollaborationOpen");
        
        this.organizationService.get().subscribe(
            response => {
                this.organization = response;
                this.isOrgLoad = true;
            }
        );
        
        this.collaborationService.getInvitations().subscribe(
            response => {

                response.forEach((row) => {
                    row['user'] = this.getUserByEmail(row.email)
                });
                
                this.invitations = response;

                this.isLoaded = true;
            }
        );
    }

    private getUserByEmail(email){

        let user = {};

        this.users.forEach((row) => {
            if (row.email == email){
                user = row;
            }
        });
        return user;
    }

    onUserDeleted(user){
  
        let users = [];

        let index = 0;

        this.invitations.forEach((row, i) => {
            if (row.email == user.email)
                index = i;
        })

        this.configService.users.forEach((row) => {
            if (row.email != this.invitations[index].email){
                users.push(row);
            }
        });

        this.configService.users = users;
        
        let id = this.invitations[index].id;
        this.invitations.splice(index, 1);

        this.collaborationService.deleteInvitation(id).subscribe(
            response => {
                    
            }
        );
    }
    
    onUserAdded(user){


        let users = this.configService.users;

        let invitation = user.invitation;

        user.account.id = user.account.id.toUpperCase();
        invitation['user'] = user.account;

        invitation['user']['user_roles'] = [];

        invitation['user']['user_roles'].push(user.role);

        this.configService.users = users.concat(user.account);

        this.invitations.unshift(invitation);
    }
}
import { Component } from '@angular/core';

import {ConfigService} from './../common/services/config';

import {AccountService} from './account/service';

@Component({
    selector: 'settings',
    templateUrl: 'settings.html'
})
export class SettingsComponent {

    users:Array<any> = [];

    constructor(private accountService:AccountService, private configService:ConfigService){

        this.users = this.configService.users;        
    }
}
import { Component, OnInit, AfterViewInit } from '@angular/core';

import {AuthorizationService} from './../../services/authorization';

import {Router} from '@angular/router';

import {ConfigService} from './../../services/config';



import { environment } from './../../../../environments/environment';

@Component({
  selector: 'header-view',
  templateUrl: 'component.html'
})
export class HeaderView implements OnInit, AfterViewInit {

	account:any;

	notifications = {
		new:0,
		all:0
	};

	openNotifications = true;

	openNotificationsFirst = false;

	openNotificationsTimeout:any;

	environmentConfig = environment;

	constructor(private router:Router, private authorizationService:AuthorizationService, private configService:ConfigService) {}

	ngOnInit() {

		if (this.configService.users){
			if (this.configService.users instanceof Array){
				this.account = this.configService.users[0];
			}
		}

		this.openNotificationsTimeout = setTimeout(() => {
            this.openNotifications = false;
        }, 1);
	}

	onPatientSelected(event){
		if (!event['is_new']){
			this.router.navigate(['/patients/'+event['patient']['id']]);
		}
	}

	openNotificationsFirstFunc(){
		
		clearTimeout(this.openNotificationsTimeout);
        this.openNotificationsTimeout = setTimeout(() => {
            this.openNotificationsFirst = true;
        }, 1000);
	}

	ngAfterViewInit(){

	}

	exit(){
        
		this.authorizationService.logout();
		location.assign('/login');
	}
}

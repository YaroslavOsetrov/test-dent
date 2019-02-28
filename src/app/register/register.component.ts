import { Component, OnInit, Inject } from '@angular/core';

import {TranslateService} from '@ngx-translate/core';

import {ActivatedRoute} from '@angular/router';

import {AuthorizationService} from './../common/services/authorization';

import {map} from 'rxjs/operators';

@Component({
  selector: 'register',
  templateUrl: 'register.html',
  styleUrls: ['styles.less'],
})
export class RegisterComponent implements OnInit {
    

    isUserCreated:boolean = false;

    createdUserResponse:any;

    currentLang:string;
    confirmationWait = false;
   
    constructor(private route:ActivatedRoute, private authorizationService:AuthorizationService, private translateService:TranslateService){



    }
    ngOnInit() {
        


         this.route.queryParams
            .subscribe((params) => {

                if (params['token'] && this.authorizationService.isAuth()){
                    this.confirmationWait = true;
                }
                
            });

        mixpanel.track("signUpOpen");

    }

    changeLang(language){

        this.translateService.use(language.value);

    }

    onUserCreated(event){
        this.createdUserResponse = event;
        this.isUserCreated = true;
    }
}

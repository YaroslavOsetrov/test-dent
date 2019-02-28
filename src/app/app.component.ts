import { Component, OnInit, OnChanges } from '@angular/core'

import {ViewEncapsulation} from '@angular/core';

import {AuthorizationService} from './common/services/authorization';

import {Router, ActivatedRoute, NavigationStart, RouteConfigLoadStart, RouteConfigLoadEnd} from '@angular/router';


import {CallService} from './settings/collaboration/service';
import {BootService} from './_boot/service';

@Component({
    selector: 'app-root',
    templateUrl:'app.html'
})
export class AppComponent implements OnInit {

    publicRoutes = [];
/*
    private currentUrl;
    isAuth:boolean = false;

    //notifications_options:any;

    isCompleteInitial:boolean = false;

    isConfirmShow = true;

    calls = [];

    account:any;

    token:any;

    loadingRouteConfig:boolean = true;*/

    calls = [];

    config = {
        isBootCompleted:false,
        isAuthorized:false,
        isLoading:false,
        isPublicRoute:false
    };

    constructor(
                private _authorizationService:AuthorizationService,
                private router:Router,
                private _bootService:BootService,
                private route:ActivatedRoute,
                private callService:CallService,
                /*private translateService:TranslateService,
              
                private configService:ConfigService,
                private registerService:RegisterService,
                private _bsLocaleService:BsLocaleService, 
                private priceService:PriceService,
                
                private organizationService:OrganizationService,
                private organizationCustomFieldService:OrganizationCustomFieldService,
                private calendarSettingsService:CalendarSettingsService,
				private CollaborationService:CollaborationService, 
                private authorizationService:AuthorizationService*/) {

      
        this.publicRoutes = ['register', 'login', 'book', 'login/invite', 'login/recovery'];
        /*this.notifications_options =  {
            timeOut: 1000,
            showProgressBar: true,
            pauseOnHover: true,
            clickToClose: true
        };*/
    }


    sendConfirmation(){
/*
        this.isConfirmShow = false;
        (swal as any)(
            this.translateService.instant('login.confirm.title'),
            this.translateService.instant('login.confirm.descr'),
            'success'
        );
        this.registerService.sendConfirmation({email:this.account.email, id:this.account.id}).subscribe();
*/
    }


    ngOnInit() {

        this.config.isAuthorized = this._authorizationService.isAuth();
        
        this._bootService.bootCompleted$.subscribe(
            completed => {
                if (completed == true){
                    setTimeout(() => {
                        this.config.isBootCompleted = true;
                    }, 500);
                    
                    this.onBootCompleted();

                }
            }
        )

        this.router.events.subscribe((event) => {

            if (event instanceof RouteConfigLoadStart) {
                this.config.isLoading = true;
            } else if (event instanceof RouteConfigLoadEnd) {
                this.config.isLoading = false;
            }

            if (event instanceof NavigationStart  ) {
                
                this.config.isPublicRoute = false;

                this.publicRoutes.forEach((route) => {
                    if (event.url.indexOf(route) != -1)
                        this.config.isPublicRoute = true;
                });

                if (!this.config.isPublicRoute && !this.config.isAuthorized){
                    this.router.navigate(['/login']);
                }

                if (this.config.isPublicRoute && this.config.isAuthorized){
                    this.router.navigate(['/calendar']);
                }
            }
         });

    }
    onBootCompleted(){
        
        setInterval(() => {
            this.callService.getCalls().subscribe(
                response => {
                    response.forEach((row) => {
                        row['patient_data'] = JSON.parse(row['patient_data']);
                    })
                    this.calls = this.calls.concat(response);
                }
            )
        }, 5000);
      
    }

    private _routeSubscribe(){
        
        
    }
/*
        if (!this.configService.users || !this.configService.scheduler || !this.configService.priceList)
            this.isCompleteInitial = false;
        else
            this.isCompleteInitial = true;
        
        if (!this.isCompleteInitial)
        Observable.forkJoin(
            this.CollaborationService.getUsers(),
            this.calendarSettingsService.get(),
            this.priceService.get(),
            this.organizationCustomFieldService.get()
        ).subscribe(
            response => {
                this.configService.users = response[0];
                this.configService.scheduler = response[1];
                this.configService.priceList = response[2];

                this.configService.custom_fields = response[3];

                this.account = this.configService.users[0];

                this.translateService.use(this.account.language);

                for (let key in dateLocale){
                    moment.defineLocale(key, {
                        months  : dateLocale[key]['months_names'],
                        monthsShort : dateLocale[key]['months_names_short'],
                        weekdays : dateLocale[key]['day_names'],
                        weekdaysShort : dateLocale[key]['day_names_short'],
                        weekdaysMin  : dateLocale[key]['day_names_min'],
                        week:{
                            dow:this.configService.scheduler.first_day_index,
                            doy:new Date(new Date().getFullYear(), 0, 1).getDay()
                        }
                    });
                }
                
                location.assign('/calendar');
            }
        );
        else{
            console.log('Complete initial');
            this.priceService.get().subscribe(
                response => {
                    this.configService.priceList = response;
                }
            )
            this.CollaborationService.getUsers().subscribe(
                response => {
                     this.configService.users = response;
                }
            )
            this.calendarSettingsService.get().subscribe(
                response => {
                    this.configService.scheduler = response;
                }
            )

            this.organizationService.getNoteTemplates().subscribe(
                response => {
                    this.configService.richNotes = response;
                }
            )

            this.organizationCustomFieldService.get().subscribe(
                response => {
                    this.configService.custom_fields = response;
                }
            )
            
             for (let key in dateLocale){
                moment.defineLocale(key, {
                    months  : dateLocale[key]['months_names'],
                    monthsShort : dateLocale[key]['months_names_short'],
                    weekdays : dateLocale[key]['day_names'],
                    weekdaysShort : dateLocale[key]['day_names_short'],
                    weekdaysMin  : dateLocale[key]['day_names_min'],
                    week:{
                        dow:this.configService.scheduler.first_day_index,
                        doy:new Date(new Date().getFullYear(), 0, 1).getDay()
                    }
                });
            }

            
        }

     /*  *1/
            

        if (this.configService.defaults){
            this.translateService.setDefaultLang(this.configService.defaults.language);
            this.translateService.use(this.configService.defaults.language);

            moment.locale(this.configService.defaults.language);
        }else{
            this.translateService.setDefaultLang('en');
            this.translateService.use('en');

            moment.locale('en');
        }
       
        if (this.isCompleteInitial){
            this.account = this.configService.users[0];
        }


        this.isAuth = this.authorizationService.isAuth();

        this.authorizationService.logout$.subscribe(
            response => {
                if (response.hasOwnProperty('logout')){
                    this.isAuth = false;
                }
            }
        )
        
        this.router.events.subscribe((event) => {

            if (event instanceof RouteConfigLoadStart) {
                this.loadingRouteConfig = true;
            } else if (event instanceof RouteConfigLoadEnd) {
                this.loadingRouteConfig = false;
            }

            if (event instanceof NavigationStart  ) {
                this.currentUrl = event.url;
                
                let isPublic = false;

                let isSpecial = false;
                for (let key in this.publicRoutes){
                    
                    if (event.url.indexOf(key) != -1){
                        isPublic = true;
                    } 
                    
                    if (event.url.indexOf('/register?token=') !== -1){
                        isSpecial = true;
                    }
                }
                if (isSpecial){
                    this.route.queryParams
                    .map(params=>params)
                    .subscribe((params) => {
                        if (params['token']){
                            this.registerService.confirmEmail({token:params['token']}).subscribe(
                                response => {

                                    this.account.is_email_confirmed = true;
                                    let users = this.configService.users;
                                    users[0] = this.account;
                                    this.configService.users = users;
                                    (swal as any)(
                                        this.translateService.instant('login.confirmed.title'),
                                        this.translateService.instant('login.confirmed.descr'),
                                        'success'
                                    );
                                    if (!this.isAuth){
                                        this.router.navigate(['/login']);
                                    }else{
                                        this.router.navigate(['/calendar']);
                                    }
                                }, errors => {
                                    (swal as any)({
                                        title:this.translateService.instant('common.form.err'),
                                        text: this.translateService.instant(errors.message),
                                        type: 'error',
                                    }, () => {
                                        if (!this.isAuth){
                                            this.router.navigate(['/login']);
                                        }else{
                                            this.router.navigate(['/calendar']);
                                        }
                                    });
                                    
                                }
                            );
                        }
                    });
                }else{
                    if (!isPublic && !this.isAuth){
                        this.router.navigate(['/register']);
                    }

                    if (isPublic && this.isAuth){
                        this.router.navigate(['/calendar']);
                    }
                }
                
            }
        });

    }*/
  //  }
}

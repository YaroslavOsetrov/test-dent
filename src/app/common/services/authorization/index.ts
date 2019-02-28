import { Directive, Inject, NgModule, ElementRef, Input, PLATFORM_ID, Renderer, Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

import {LocalStorage} from './../../modules/localstorage';

import {isPlatformBrowser} from '@angular/common';

export class AuthorizationToken{
    hash:string;
    is_expired_subscription :boolean;
}

@Injectable()
export class AuthorizationService{

    private authorizationToken:AuthorizationToken;

    private organization:any;
    private user:any;

    private initialToken:string;

    private _logout = new BehaviorSubject<Object>({});
    logout$ = this._logout;

    localStorage:any;

    private _initToken = new BehaviorSubject<Object>({});
    initToken$ = this._initToken;
    
    setInitToken(token){
        this._initToken.next(token);
    }

    constructor(private router:Router,
                @Inject(PLATFORM_ID) private platformId: Object) {

         if (isPlatformBrowser(this.platformId)) {
            this.localStorage = localStorage;
         }else{
             this.localStorage = {
                 getItem(){
                     return null;
                 },
                 setItem(){
                     return null;
                 }
             }
         }

        try{
            this.authorizationToken = JSON.parse(this.localStorage.getItem('APP_AUTH_TOKEN'));

            this.user = JSON.parse(this.localStorage.getItem('APP_USER'));
            this.organization = JSON.parse(this.localStorage.getItem('APP_ORGANIZATION'));
        }
        catch(e){
            this.authorizationToken = null;
        }
    }

    isAuth(){
        return (this.authorizationToken != null);
    }

    getToken() {

        if (this.initialToken)
            return this.initialToken;

        return this.isAuth() ? this.authorizationToken.hash : null;
    }

    initAppData(user, organization){
        this.localStorage.setItem('APP_USER', JSON.stringify(user));
        this.localStorage.setItem('APP_ORGANIZATION', JSON.stringify(organization));
    }

    getUser(){
        return this.user;
    }

    getOrganization(){
        return this.organization;
    }

    setToken(token:AuthorizationToken){

        this.initialToken = token.hash;

        this.localStorage.setItem('APP_AUTH_TOKEN', JSON.stringify(token));

    }

    logout() {
     //   this.cache.remove('APP_AUTH');
        this.authorizationToken = null;
        this.localStorage.removeItem('APP_AUTH_TOKEN');
        this.localStorage.removeItem('APP_USER');
        this.localStorage.removeItem('APP_USERS');
        this.localStorage.removeItem('APP_PRICELIST');
        this.localStorage.removeItem('APP_SCHEDULER');
        this.localStorage.removeItem('APP_CONFIG');
        this.localStorage.removeItem('APP_ORGANIZATION');

        this._logout.next({logout:true});

        this.router.navigate(['/login']);
    }


}


@Directive({ selector: '[authorization]' })
export class AuthorizationDirective {

    @Input() authorization: boolean;

    private renderer:any;
    private el:any;

    constructor(_el: ElementRef, 
                _renderer: Renderer, 
                private authorizationService: AuthorizationService ) {
        
        this.el = _el;
        this.renderer = _renderer;
       
    }

    ngOnInit(){

         if (this.authorization == true && this.authorizationService.isAuth() == false)
            this.renderer.setElementStyle(this.el.nativeElement, 'display', 'none');

        if (this.authorization == false && this.authorizationService.isAuth() == true)
            this.renderer.setElementStyle(this.el.nativeElement, 'display', 'none');
    }
}

@NgModule({
    declarations: [
        AuthorizationDirective
    ],
    providers:[
        AuthorizationService
    ],
    exports: [
        AuthorizationDirective
    ]
})
export class AuthorizationModule{}
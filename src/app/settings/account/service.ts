import { RESTClient, Path, PUT, DELETE, POST, GET, BaseUrl, DefaultHeaders, Body } from './../../common/modules/rest-client';

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject,BehaviorSubject } from 'rxjs';

import {AuthorizationService} from './../../common/services/authorization';

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('')
export class AccountService extends RESTClient {

    constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }

    @GET('/api/v1/account')
    get():Observable<any>{return null;}

    @GET('/public/i18n/time_zones/{language}.json')
    public getTimeZones(@Path("language") language:string,): Observable<any> { language = ''; return null; };

    @PUT('/api/v1/account')
    save(@Body account):Observable<any>{return null;}

}
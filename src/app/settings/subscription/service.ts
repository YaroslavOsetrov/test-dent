import { RESTClient, Path, PUT, DELETE, POST, GET, BaseUrl, DefaultHeaders, Body } from './../../common/modules/rest-client';

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject,BehaviorSubject } from 'rxjs';
import {AuthorizationService} from './../../common/services/authorization';

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1/organization/subscription')
export class SubscriptionService extends RESTClient {

    constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }

    @GET('/')
    get(): Observable<any> { return null; };

    @POST('/')
    create(@Body subscription):Observable<any> {return null;};

    @PUT('/')
    save(@Body subscription):Observable<any> {return null;};

    @GET('/services')
    getPrice():Observable<any> {return null;}

    @GET('/payments')
    getPayments():Observable<any> {return null;}

    @POST('/recharge')
    recharge():Observable<any> {return null;}

    @POST('/payments/sms')
    addSMS():Observable<any> {return null;};

    @POST('/payments/storage')
    addStorage():Observable<any> {return null;};

}
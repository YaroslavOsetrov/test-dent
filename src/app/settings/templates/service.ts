import { RESTClient, Path, PUT, DELETE, POST, GET, BaseUrl, DefaultHeaders, Body } from './../../common/modules/rest-client';

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject,BehaviorSubject } from 'rxjs';

import {AuthorizationService} from './../../common/services/authorization';

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1/organization/notifications')
export class OrganizationNotificationService extends RESTClient {

    constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }

    @GET('/')
    get(): Observable<any> { return null; };


    @PUT('/')
    save(@Body notification): Observable<any> {return null;}

}
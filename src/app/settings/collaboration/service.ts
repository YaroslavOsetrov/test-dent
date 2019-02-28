import { RESTClient, Path, PUT, DELETE, POST, GET, BaseUrl, DefaultHeaders, Body } from './../../common/modules/rest-client';

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject,BehaviorSubject } from 'rxjs';

import {AuthorizationService} from './../../common/services/authorization';

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1/organization/collaboration')
export class CollaborationService extends RESTClient {

    constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }

    @GET('/users')
    getUsers():Observable<any>{return null;}

    @PUT('/user/{userId}')
    save(@Path('userId') userId, @Body userRole):Observable<any>{return null};

    @GET('/invitations')
    getInvitations(): Observable<any> { return null; };

    @POST('/invitations')
    addInvitation(@Body invitation):Observable<any> {return null;}

    @DELETE('/invitation/{invitationId}')
    deleteInvitation(@Path('invitationId') invitationId):Observable<any>{return null;}
    

}

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1/organization/calls')
export class CallService extends RESTClient {
    constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }

    @GET('/incoming')
    getCalls(): Observable<any> {return null;}
}
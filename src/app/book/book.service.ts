import { RESTClient, POST, Path, GET, PUT, BaseUrl, DefaultHeaders, Body } from '@common/modules/rest-client';



import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

import {AuthorizationService} from '@common/services/authorization';

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1')
export class BookService extends RESTClient {


    public constructor(protected _http: HttpClient, protected authorizationService:AuthorizationService) {
        super(_http, authorizationService);
    }

    @GET('/book/{code}/providers')
    getProviders( @Path('code') code: any): Observable<any> { return null; };

    @POST('/book/{organizationId}/{providerId}/add')
    addRequest( @Path('organizationId') organizationId: any, @Path('providerId') providerId: any, @Body body): Observable<any> { return null; };


    @GET('/book/{organizationId}/{providerId}')
    getSettings(@Path('organizationId') organizationId:any, @Path('providerId') providerId:any): Observable<any> { return null; };

    @GET('/book/{organizationId}/{providerId}/freeSlots/{start}/{end}')
    getSlots(@Path('organizationId') organizationId:any, @Path('providerId') providerId:any, @Path('start') start:any, @Path('end') end:any):Observable<any> { return null; };

    @GET('/organization/widget')
    getAuthSettings(): Observable<any> { return null; };

    @PUT('/organization/widget')
    saveSettings(@Body settings): Observable<any> { return null; };

}
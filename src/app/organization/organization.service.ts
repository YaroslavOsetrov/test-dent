import { RESTClient, Path, PUT, GET, BaseUrl, DefaultHeaders, Body } from './../common/modules/rest-client';

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

import {AuthorizationService} from './../common/services/authorization';

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1')
export class OrganizationCollaborationService extends RESTClient {

    public constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }

    @GET('/organization/users')
    public getUsers():Observable<any>{return null;}

}

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1')
export class OrganizationService extends RESTClient {

    public constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }

    @GET('/organization/icd10')
    public getDiagnosis():Observable<any>{return null;}

}


@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1/organization')
export class OrganizationInvoice extends RESTClient {

    public constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }

    @GET('/invoices/{startDate}/{endDate}')
    public get(@Path('startDate') start, @Path('endDate') end):Observable<any>{return null;}

}



@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1')
export class OrganizationTasksService extends RESTClient {

    public constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }

    @GET('/organization/tasks/{tasksType}/{page}/{keys}')
    public get(@Path("tasksType") tasksType:string, @Path("page") page:number, @Path("keys") keys?):Observable<any>{return null;}

    @GET('/organization/tasks/tags')
    public getTags():Observable<any>{return null;}

}

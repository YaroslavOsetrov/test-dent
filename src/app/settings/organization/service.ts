import { RESTClient, Path, PUT, DELETE, POST, GET, BaseUrl, DefaultHeaders, Body } from './../../common/modules/rest-client';

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject,BehaviorSubject } from 'rxjs';

import {AuthorizationService} from '@common/services/authorization';

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('')
export class OrganizationService extends RESTClient {

    constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }

    @GET('/api/v1/organization')
    get(): Observable<any> { return null; };

    @POST('/api/v1/organization')
    create(@Body subscription):Observable<any> {return null;};

    @PUT('/api/v1/organization')
    save(@Body organization):Observable<any> {return null;};

    @GET('/api/v1/organization/richNoteTemplates')
    getNoteTemplates(): Observable<any> {return null; };

    @GET('/api/v1/organization/offices')
    getOffices():Observable<any> {return null;};

    @POST('/api/v1/organization/offices')
    addOffice(@Body office:any):Observable<any> {return null;};

    @POST('/api/v1/organization/offices/{officeId}/rooms')
    addRooms(@Path('officeId') officeId, @Body rooms:any):Observable<any> {return null;};

    @DELETE('/api/v1/organization/offices/{officeId}/rooms')
    deleteRooms(@Path('officeId') officeId, @Body rooms:any):Observable<any> {return null;};

    @PUT('/api/v1/organization/richNoteTemplates')
    saveNoteTemplates(@Body templates:any): Observable<any> {return null; };

    @GET('/public/i18n/time_zones/{language}.json')
    getTimeZones(@Path("language") language:string): Observable<any> { language = ''; return null; };

    @GET('/public/i18n/currencies/{language}.json')
    getCurrencies(@Path("language") language:string): Observable<any> { language = ''; return null; };

    @GET('/api/v1/organization/customFields')
    getCustomFields():Observable<any>{return null;}

    @POST('/api/v1/organization/customFields')
    addCustomFields(@Body fields: any):Observable<any>{return null;}

    @GET('/api/v1/organization/docs')
    getDocuments(): Observable<any> { return null; };

    @POST('/api/v1/organization/docs')
    createDocument(@Body doc):Observable<any> {return null;};

    @DELETE('/api/v1/organization/docs/{documentId}')
    deleteDocument(@Path('documentId') documentId:string):Observable<any> {return null;};

    @PUT('/api/v1/organization/docs/{documentId}')
    saveDocument(@Path("documentId") documentId:string, @Body doc):Observable<any> {return null;};

    @GET('/api/v1/organization/tasks/{userId}/{startDate}/{endDate}')
    getTasks(@Path('userId') userId, @Path('startDate') startDate, @Path('endDate') endDate):Observable<any>{return null;}

    @GET('/api/v1/organization/tasks/{userId}/due')
    getDueTasks(@Path('userId') userId):Observable<any>{return null;}

}
import { RESTClient, DELETE, Path, Query, PUT, POST, GET, BaseUrl, DefaultHeaders, Body } from './../common/modules/rest-client';

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

import {AuthorizationService} from './../common/services/authorization';
@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1')
export class CalendarSettingsService extends RESTClient {

    public constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }

    @GET('/organization/scheduler')
    public get():Observable<any>{return null;}

    @PUT('/organization/scheduler')
    public save(@Body organizationScheduler: any):Observable<any>{return null;}

}

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1')
export class AppointmentService extends RESTClient {

    public constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }

    @GET('/analyticsDaily/{start}/scheduler')
    getDailyStats(@Path('start') start:string):Observable<any>{return null;}

    @POST('/appt/print/{date}')
    printAppts(@Path('date') date:string):Observable<any>{return null;}

    @GET('/appt/{start}/{end}')
    public getInterval(@Path('start') start:string, @Path('end') end:string):Observable<any>{return null;}

    @GET('/appt/freecells/{date}/{providerId}/{sectionId}')
    public getFreeCells(@Path('date') date:string, @Path('providerId') providerId:string, @Path('sectionId') sectionId:number, @Query('start') startTime:string, @Query('end') endTime:string):Observable<any>{return null;}

    @GET('/apptRequest/{start}/{end}')
    getBookings(@Path('start') start:string, @Path('end') end:string):Observable<any>{return null;}

    @DELETE('/apptRequest/{id}')
    deleteBooking(@Path('id') id:string):Observable<any>{return null;}

    @POST('/patient/{patientId}/appts')
    public add(@Path('patientId') patientId:string, @Body appointment):Observable<any>{return null;}

    @POST('/appt/blank')
    public addBlank(@Body appointment):Observable<any>{return null;}

    @PUT('/appt/blank')
    public saveBlank(@Body appointment):Observable<any>{return null;}

    @POST('/workhours')
    public saveWorkhour(@Body workhour):Observable<any>{return null;}

    @DELETE('/workhours/{workhourId}')
    public deleteWorkhour(@Path('workhourId') workhourId:string):Observable<any>{return null;}

    @GET('/workhours/{start}/{end}')
    public getWorkhours(@Path('start') start:string, @Path('end') end:string):Observable<any>{return null;}

    @PUT('/patient/{patientId}/appt/{apptId}')
    public save(@Path('patientId') patientId:string, @Path('apptId') apptId:string, @Body appointment):Observable<any>{return null;}

}

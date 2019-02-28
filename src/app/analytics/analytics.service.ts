import { RESTClient, Path, PUT, DELETE, POST, GET, Query, BaseUrl, DefaultHeaders, Body } from './../common/modules/rest-client';

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject, BehaviorSubject }    from 'rxjs';

import {AuthorizationService} from './../common/services/authorization';

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1/analytics')
export class AnalyticsService extends RESTClient {

    constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }

    @GET('/{startDate}/{endDate}/{query}')
    getStats(@Path('startDate') startDate, @Path('endDate') endDate, @Path('query') query, @Query('providerId') providerId):Observable<any>{return null;};

}
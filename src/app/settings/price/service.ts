import { RESTClient, PUT, GET, BaseUrl, DefaultHeaders, Body } from './../../common/modules/rest-client';

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

import { PriceList } from './model';

import {AuthorizationService} from './../../common/services/authorization';
@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1')
export class PriceService extends RESTClient {

    public constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }



    @GET('/organization/price')
    public get():Observable<any>{return null;}

    @PUT('/organization/price')
    public save ( @Body data: PriceList): Observable<any> { return null; };

}

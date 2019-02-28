import { RESTClient, DELETE, Query, Path, POST, GET, BaseUrl, DefaultHeaders, Body } from '@common/modules/rest-client';

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

import {AuthorizationService} from '@common/services/authorization';
@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1/organization/inventory')
export class InventoryService extends RESTClient {

    public constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }



    @GET('/')
    get():Observable<any>{return null;}

    @GET('/?ids={ids}')
    getByIds(@Path('ids') ids:any):Observable<any>{return null;}

    @GET('/search/{value}')
    search(@Path('value') value):Observable<any>{return null;}

    @POST('/')
    save(@Body inventory):Observable<any>{return null;}

    @POST('/transaction')
    addTransaction(@Body inventoryTransaction):Observable<any>{return null;}

    @DELETE('/')
    delete(@Body ids):Observable<any>{return null;}


}

import { RESTClient, DELETE, Path, POST, GET, BaseUrl, DefaultHeaders, Body } from '@common/modules/rest-client';

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

import { PriceList } from './model';

import {AuthorizationService} from '@common/services/authorization';
@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1/organization/procedures')
export class ProceduresService extends RESTClient {

    public constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }



    @GET('/')
    get():Observable<any>{return null;}

    @POST('/')
    save (@Body procedures): Observable<any> { return null; };

    @DELETE('/')
    delete(@Body Ids): Observable<any> { return null; };

    @DELETE('/{procedureId}/inventory/{inventoryId}')
    deleteInventory(@Path('procedureId') procedureId, @Path('inventoryId') inventoryId): Observable<any> { return null; };

    @POST('/{procedureId}/inventory')
    saveInventory(@Path('procedureId') procedureId, @Body proceduresInventory): Observable<any> { return null; };

}

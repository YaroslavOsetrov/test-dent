import { RESTClient, POST, GET, BaseUrl, DefaultHeaders, Body } from './../../../../../common/modules/rest-client';

import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1/organization/customFields')
export class OrganizationCustomFieldService extends RESTClient {
    
    @GET('/')
    get():Observable<any>{return null;}

    @POST('/')
    add(@Body fields: any):Observable<any>{return null;}

}
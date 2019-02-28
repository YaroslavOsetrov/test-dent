import { RESTClient, POST, BaseUrl, DefaultHeaders, Body } from './../common/modules/rest-client';



import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

import { RegisterUser, RegisterConfirmResponse, RegisterToken, InitialUser } from './register.model';
import {AuthorizationService} from './../common/services/authorization';

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1/registration')
export class RegisterService extends RESTClient {


    public constructor(protected _http: HttpClient, protected authorizationService:AuthorizationService) {
        super(_http, authorizationService);
    }

    @POST('/initialLogin')
    initialLogin ( @Body data: any): Observable<any> { return null; };

    @POST('/confirmEmail')
    confirmEmail ( @Body data:any): Observable<any> { return null; };

    @POST('/sendConfirmation')
    sendConfirmation(@Body data:any):Observable<any>{return null;};

    @POST('/')
    createAccount( @Body account: RegisterUser): Observable<any> { return null; };

    @POST('/checkEmail')
    checkEmail(@Body account:any):Observable<any>{return null}

}

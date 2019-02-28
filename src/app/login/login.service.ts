import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import { RESTClient, GET, Path, POST, BaseUrl, DefaultHeaders, Body } from './../common/modules/rest-client';
import {Observable} from 'rxjs';

import {AuthorizationService} from './../common/services/authorization';
import {LoginUser} from './login.model';

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1/login')
export class LoginService extends RESTClient {

    public constructor(protected _http: HttpClient, protected authorizationService:AuthorizationService) {
        super(_http, authorizationService);
    }

    @POST('')
    public login( @Body account: LoginUser): Observable<any> { return null; };

    @POST('/confirm/{organizationId}')
    loginConfirm(@Path('organizationId') organizationId, @Body loginParams):Observable<any> { return null;};

    @GET('/invite/{inviteId}')
    checkInvite(@Path('inviteId') inviteId):Observable<any>{return null;};

    @POST('/invite/{inviteId}')
    confirmInvite(@Path('inviteId') inviteId, @Body invite):Observable<any> {return null;};

    @POST('/recovery/request')
    requestRecovery(@Body recovery):Observable<any>{return null;};

    @POST('/recovery/confirm')
    confirmRecovery(@Body recovery):Observable<any>{return null;}

    @POST('/recovery/validate')
    validateRecovery(@Body recovery):Observable<any>{return null;}
    

}
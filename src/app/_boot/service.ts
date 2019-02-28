import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import { RESTClient, GET, Path, POST, BaseUrl, DefaultHeaders, Body } from './../common/modules/rest-client';
import {Observable, BehaviorSubject} from 'rxjs';

import {AuthorizationService} from './../common/services/authorization';

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1/')
export class BootService extends RESTClient {

    constructor(protected _http: HttpClient, protected authorizationService:AuthorizationService) {
        super(_http, authorizationService);
    }

    private _bootCompleted = new BehaviorSubject<Object>({});
    bootCompleted$ = this._bootCompleted;

    setBootCompleted(value){
        this._bootCompleted.next(value);
    }

    @GET('/init')
    initCheck():Observable<any>{return null;}

    @GET('/organization/collaboration/users')
    getUsers():Observable<any>{return null;}

    @GET('/organization/scheduler')
    getSchedulerSections():Observable<any>{return null;}

    @GET('/organization/price')
    getPriceList():Observable<any>{return null;}

    @GET('/organization/customFields')
    getPatientFields():Observable<any>{return null;}

    @GET('/organization/offices')
    getOffices():Observable<any>{return null;}

    @GET('/organization/procedures')
    getProcedures():Observable<any>{return null;}

    @GET('/organization/richNoteTemplates')
    getRichNoteTemplates():Observable<any>{return null;}

}


@Injectable()
export class BootInitService {


    token = null;
    constructor(protected _http:HttpClient){

    }

    setToken(token){
        this.token = token;
    }

    getRequest(url):Observable<any>{

        return this._http.get(url, {
            headers:new HttpHeaders({
                authorization:this.token
            })
        })

    }

}
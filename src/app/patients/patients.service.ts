import { RESTClient, Path, PUT, DELETE, POST, GET, BaseUrl, DefaultHeaders, Body } from './../common/modules/rest-client';

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject, BehaviorSubject } from 'rxjs';

import {AuthorizationService} from './../common/services/authorization';

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1')
export class PatientService extends RESTClient {

    constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }


    private _patientId = new BehaviorSubject<string>('');
    patientId$ = this._patientId;

    private _patient = new BehaviorSubject<Object>({});
    patient$ = this._patient;

    private _newInvoice = new BehaviorSubject<Object>({});
    newInvoice$ = this._newInvoice;

    setPatientId(id) {
        this._patientId.next(id);
    }

    setPatient(patient){
        this._patient.next(patient);
    }

    setNewInvoice(invoice){
        this._newInvoice.next(invoice);
    }

    @GET('/patients/{group}/{page}/{sort}/{search}')
    get(@Path('group') group, @Path('page') page, @Path('sort') sort, @Path('search') search):Observable<any>{return null;}

    @GET('/patients/stats')
    getStats():Observable<any>{return null;}

    @POST('/patients')
    add(@Body patient: any):Observable<any>{return null;}

    @PUT('/patient/{id}')
    save(@Path('id') id, @Body patient):Observable<any>{return null};

    @GET('/patient/{id}')
    getById(@Path('id') id):Observable<any>{return null};

    @GET('/patient/{id}/logs/all/{page}')
    getLogs(@Path('id') id, @Path('page') page):Observable<any>{return null};

    @POST('/patient/{id}/logs')
    getLogsResources(@Path('id') id, @Body resources):Observable<any>{return null};

    @GET('/patient/{id}/logs/upcoming')
    getLogsUpcoming(@Path('id') id):Observable<any>{return null};

    @GET('/patient/{id}/plans/{planId}/print')
    printPlan(@Path('id') patientId, @Path('planId') planId):Observable<any>{return null;}

    @GET('/patient/{id}/appts')
    getAppts(@Path('id') id):Observable<any>{return null;}

    @GET('/patient/{id}/notes')
    getNotes(@Path('id') id):Observable<any>{return null;}

    @POST('/patient/{id}/notes')
    addNote(@Path('id') id, @Body note):Observable<any>{return null;}

    @PUT('/patient/{id}/notes/{noteId}')
    saveNote(@Path('id') id, @Path('noteId') noteId, @Body note):Observable<any>{return null;}

    @DELETE('/patient/{id}/notes/{noteId}')
    deleteNote(@Path('id') id, @Path('noteId') noteId):Observable<any>{return null;}
    
    @GET('/patient/{id}/richNotes')
    getRichNotes(@Path('id') id):Observable<any>{return null;}

    @POST('/patient/{id}/richNotes')
    saveRichNotes(@Path('id') id, @Body note):Observable<any>{return null;}

    @PUT('/patient/{id}/richNotes/{noteId}')
    saveRichNote(@Path('id') id, @Path('noteId') noteId, @Body note):Observable<any>{return null;}

    @DELETE('/patient/{id}/richNotes/{noteId}')
    deleteRichNote(@Path('id') id, @Path('noteId') noteId):Observable<any>{return null;}

    @GET('/patient/{id}/print')
    printHistory(@Path('id') id):Observable<any>{return null;}

    @GET('/patients/patientPhone/{phone}')
    searchByPhone(@Path('phone') phone):Observable<any>{return null;}

    @GET('/patient/{id}/procedures/appt/{page}')
    getProcedure(@Path('id') id, @Path('page') page):Observable<any>{return null;}

    @PUT('/patient/{id}/procedures/saveInventory')
    saveProcedureInventory(@Path('id') id, @Body body):Observable<any>{return null};

    @GET('/patient/{id}/procedures/unsched')
    getUnschedProcedure(@Path('id') id):Observable<any>{return null;}

    @POST('/patient/{id}/procedures')
    addProcedure(@Path('id') id, @Body procedures):Observable<any>{return null;}

    @PUT('/patient/{id}/procedures/changeStatus')
    changeStatus(@Path('id') id, @Body procedures):Observable<any>{return null;}

    @DELETE('/patient/{id}/procedures')
    deleteProcedures(@Path('id') id, @Body procedureIds):Observable<any>{return null;}

    @PUT('/patient/{id}/procedures/indexes')
    updateProcedureIndexes(@Path('id') id, @Body procedures):Observable<any>{return null;}

    @GET('/patient/{id}/plans')
    getPlans(@Path('id') id):Observable<any>{return null;}

    @GET('/patient/{id}/plans/{planId}')
    getPlanProcedures(@Path('id') id, @Path('planId') planId):Observable<any>{return null;}

    @POST('/patient/{id}/plans')
    addPlan(@Path('id') id, @Body plan):Observable<any>{return null;}
    
    @GET('/patient/{id}/unassignedPlans')
    getPlanToTreatment(@Path('id') id):Observable<any>{return null;}
    
    @PUT('/patient/{id}/plans/{planId}')
    savePlan(@Path('id') id, @Path('planId') planId, @Body plan):Observable<any>{return null;}

    @DELETE('/patient/{id}/plans/{planId}')
    deletePlan(@Path('id') id, @Path('planId') planId):Observable<any>{return null;}

    @PUT('/patient/{id}/access')
    sharePatient(@Path('id') id, @Body userIds):Observable<any>{return null;}

    @GET('/patient/{id}/access')
    getAccess(@Path('id') id):Observable<any>{return null;}

    @GET('/patient/{id}/tasks')
    getTasks(@Path('id') patientId):Observable<any>{return null;}

    @POST('/patient/{id}/tasks')
    addTask(@Path('id') patientId, @Body patientTask: any):Observable<any>{return null;}

    @PUT('/patient/{id}/task/{taskId}')
    saveTask(@Path('id') patientId, @Path('taskId') taskId, @Body patientTask):Observable<any>{return null;}

    @DELETE('/patient/{id}/task/{taskId}')
    deleteTask(@Path('id') patientId, @Path('taskId') taskId):Observable<any>{return null;}

    @POST('/patient/{id}/invoices')
    addInvoice(@Path('id') patientId, @Body invoice):Observable<any>{return null;}

    @GET('/patient/{id}/invoices')
    getInvoices(@Path('id') patientId):Observable<any>{return null;}

}

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('')
export class ICD10Service extends RESTClient {

    @GET('/public/i18n/icd_codes/{lang}.json')
    getCodes(@Path('lang') lang):Observable<any>{return null;}

}

@Injectable()
@DefaultHeaders({
    'Content-Type': 'application/json'
})
@BaseUrl('/api/v1')
export class PatientTaskService extends RESTClient {

    constructor(protected _http: HttpClient, protected authService:AuthorizationService) {
        super(_http, authService);
    }

    @GET('/patient/{id}/tasks')
    get(@Path('id') patientId):Observable<any>{return null;}

    @POST('/patient/{id}/tasks')
    add(@Path('id') patientId, @Body patientTask: any):Observable<any>{return null;}

    @PUT('/patient/{id}/task/{taskId}')
    save(@Path('id') patientId, @Path('taskId') taskId, @Body patientTask):Observable<any>{return null;}

    @DELETE('/patient/{id}/task/{taskId}')
    delete(@Path('id') patientId, @Path('taskId') taskId):Observable<any>{return null;}

}


@Injectable()
export class PatientCommunicationService{

    
}

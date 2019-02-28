import {Injectable, Inject, Injector} from '@angular/core';
import {
    Request, RequestOptions, RequestMethod as RequestMethods, RequestOptionsArgs,
    Response,
    URLSearchParams
} from '@angular/http';
import {HttpClient,HttpResponse, HttpRequest, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {map, catchError } from 'rxjs/operators';

import {AuthorizationService} from './../../services/authorization';

import {environment} from './../../../../environments/environment';


/**
 * Angular 2 RESTClient class.
 *
 * @class RESTClient
 * @constructor
 */
export class RESTClient {

    protected authToken: string = null;

    public constructor(
        @Inject(HttpClient) protected http: HttpClient,
        @Inject(AuthorizationService) protected authService:AuthorizationService,
        ) {
            this.authToken = (this.authService) ? this.authService.getToken() : '';
    }

    protected getBaseUrl(): string {
        return null;
    };

    private _serverError(err: any) {


        if (err.status == 403 && this.authService.isAuth()){
            this.authService.logout();
            location.assign('/login');
        }
        //console.log('sever error:', err);  // debug
        if(err instanceof Response) {
          //  document.getElementById('loader').style.visibility = 'hidden';
         //   return throwError(err.json() || 'backend server error');
            // if you're using lite-server, use the following line
            // instead of the line above:
            //return Observable.throw(err.text() || 'backend server error');
        }
        
      //  return throwError(err.json() || 'backend server error');
    }

    protected getDefaultHeaders(): Object {
        return {
            'Authorization':this.authToken
        };
    };

    /**
     * Request Interceptor
     *
     * @method requestInterceptor
     * @param {Request} req - request object
     */
    protected requestInterceptor(req: Request) {
    //    document.getElementById('loader').style.visibility = 'visible';
    }

    /**
     * Response Interceptor
     *
     * @method responseInterceptor
     * @param {Response} res - response object
     * @returns {Response} res - transformed response object
     */
    protected responseInterceptor(res: Response): Response {
    //    document.getElementById('loader').style.visibility = 'hidden';
        return res;
    }

}

/**
 * Set the base URL of REST resource
 * @param {String} url - base URL
 */
export function BaseUrl(url: string) {
    return function <TFunction extends Function>(Target: TFunction): TFunction {
        Target.prototype.getBaseUrl = function() {
            return url;
        }
        return Target;
    }
}

/**
 * Set default headers for every method of the RESTClient
 * @param {Object} headers - deafult headers in a key-value pair
 */
export function DefaultHeaders(headers: any) {
    return function <TFunction extends Function>(Target: TFunction): TFunction {
        Target.prototype.getDefaultHeaders = function() {
            return headers;
        }
        return Target;
    }
}

function paramBuilder(paramName: string) {
    return function(key: string) {
        return function(target: RESTClient, propertyKey: string, parameterIndex: number) {
            let metadataKey = propertyKey +'_' + paramName + '_parameters';
            let paramObj: any = {
                parameterIndex: parameterIndex,
                key: key
            }
            if (Array.isArray(target[metadataKey])) {
                target[metadataKey].push(paramObj);
            }
            else {
                target[metadataKey] = [paramObj];
            }
        };
    };
}

/**
 * Path letiable of a method's url, type: string
 * @param {string} key - path key to bind value
 */
export var Path = paramBuilder("Path");
/**
 * Query value of a method's url, type: string
 * @param {string} key - query key to bind value
 */
export var Query = paramBuilder("Query");
/**
 * Body of a REST method, type: key-value pair object
 * Only one body per method!
 */
export var Body = paramBuilder("Body")("Body");
/**
 * Custom header of a REST method, type: string
 * @param {string} key - header key to bind value
 */
export var Header = paramBuilder("Header");


/**
 * Set custom headers for a REST method
 * @param {Object} headersDef - custom headers in a key-value pair
 */
export function Headers(headersDef: any) {
    return function(target: RESTClient, propertyKey: string, descriptor: any) {
        descriptor.headers = headersDef;
        return descriptor;
    }
}

function methodBuilder(method: string) {
    return function(url: string) {

        return function(target: RESTClient, propertyKey: string, descriptor: any) {

            let pPath = target[`${propertyKey}_Path_parameters`];
            let pQuery = target[`${propertyKey}_Query_parameters`];
            let pBody = target[`${propertyKey}_Body_parameters`];
            let pHeader = target[`${propertyKey}_Header_parameters`];

            

            let methodCore = method;

            descriptor.value = function(...args: any[]) {

                // Body
                let body = null;
                if (pBody) {
                    body = args[pBody[0].parameterIndex];
                }


                let urlClean = Object.assign({}, {url:url});

                // Path
                if (pPath) {
                    for (let k in pPath) {
                        url = url.replace("{" + pPath[k].key + "}", args[pPath[k].parameterIndex]);
                    }
                }

                /*// Query
                let search = new URLSearchParams()
                if (pQuery) {
                    pQuery
                        .filter(p => args[p.parameterIndex]) // filter out optional parameters
                        .forEach(p => {
                            let key = p.key;
                            let value = args[p.parameterIndex];
                            // if the value is a instance of Object, we stringify it
                            if (value instanceof Object) {
                                value = JSON.stringify(value);
                            }
                            search.set(encodeURIComponent(key), encodeURIComponent(value));
                        })
                }*/

                // Headers

                let headersDefault = this.getDefaultHeaders();

                if (this.authToken)
                headersDefault['authorization'] = this.authToken;

                let headers = new HttpHeaders(headersDefault);
                for (let k in descriptor.headers) {
                    headers.append(k, descriptor.headers[k]);
                }
                if (pHeader) {
                    for (let k in pHeader) {
                        headers.append(pHeader[k].key, args[pHeader[k].parameterIndex]);
                    }
                }
                
               /* let newRequest = new HttpRequest(
                    methodCore, 
                    
                  /*  {
                        headers:headers,
                        body:body
                    }/
                    body
                )*/

                // make the request and store the observable for later transformation
                let observableA : Observable<HttpResponse<any>> = this.http.request(
                    methodCore,
                    (this.getBaseUrl() + url).replace('//api', '/api').replace('v1//', 'v1/'),
                    {
                        headers:headers,
                        body:body
                    }
                );
                url = urlClean.url;
                let observable:any;
                // intercept the response
                //observableA.subscribe(res=>{}, err=>{if(err){document.getElementById('loader').style.visibility = 'hidden';}});
                
                observable = observableA
                .pipe(
                    catchError(err => err.code === 404 
                    ? throwError("Not found")
                    : throwError(err)
                ));
                return observable;
            };

            return descriptor;
        };
    }
}

/**
 * GET method
 * @param {string} url - resource url of the method
 */
export const GET = methodBuilder('GET');
/**
 * POST method
 * @param {string} url - resource url of the method
 */
export const POST = methodBuilder('POST');
/**
 * PUT method
 * @param {string} url - resource url of the method
 */
export const PUT = methodBuilder('PUT');
/**
 * DELETE method
 * @param {string} url - resource url of the method
 */
export const DELETE = methodBuilder('DELETE');

export const OPTIONS = methodBuilder('OPTIONS');

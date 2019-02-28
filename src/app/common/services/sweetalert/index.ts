import * as swal from 'sweetalert2';
import {Injectable} from '@angular/core';

import {TranslateService} from '@ngx-translate/core';

import {Observable} from 'rxjs';

export class SweetAlertModel{
    title:any;
    text:any;
    type?:any;
    confirm_text?:any;
    resolveParams?:{title?:any, text?:any}
}

@Injectable()
export class SweetAlertService{

    constructor(private _translateService:TranslateService){

    }

    input(data:SweetAlertModel, validate?:any){

        return new Promise((resolve, reject) => {

            (swal as any)({
                title: this._translateService.instant(data.title, (data.resolveParams) ? data.resolveParams.title : {}),
                text: this._translateService.instant(data.text, (data.resolveParams) ? data.resolveParams.text : {}),
                input: 'text',
                cancelButtonText:this._translateService.instant('common.form.canc'),
                showCancelButton: true,
                cancelButtonClass: "btn-secondary",
                confirmButtonText: this._translateService.instant('common.form.conf'),
                showConfirmButton: true,
                confirmButtonClass: "btn-primary",
                inputValidator: (value) => {
                    return !value
                }
            }).then(response => {
                if (response.value){
                    resolve(response.value);
                }
            })
        });
    }



    message(data:SweetAlertModel){

        let text = this._translateService.instant('common.form.conf');

        if (data.confirm_text){
            text = this._translateService.instant(data.confirm_text);
        }

        (swal as any)({
            title:this._translateService.instant(data.title, (data.resolveParams) ? data.resolveParams.title : {}),
            text:this._translateService.instant(data.text, (data.resolveParams) ? data.resolveParams.text : {}),
            type:data.type,
            confirmButtonText: text,
            showConfirmButton: true,
        });
    }

    confirm(data:SweetAlertModel){
        return new Promise((resolve, reject) => {
            (swal as any)({
                title: this._translateService.instant(data.title, (data.resolveParams) ? data.resolveParams.title : {}),
                text: this._translateService.instant(data.text, (data.resolveParams) ? data.resolveParams.text : {}),
                cancelButtonText:this._translateService.instant('common.form.canc'),
                showCancelButton: true,
                cancelButtonClass: "btn-secondary",
                confirmButtonText: this._translateService.instant('common.form.conf'),
                showConfirmButton: true,
                confirmButtonClass: "btn-primary"
            }).then(confirmed => {
                if (confirmed.value){
                    resolve(true);
                }
            })
        });
    }

    loader(data:SweetAlertModel, httpRequest:Observable<any>, responseFunc:Function, errorsFunc?:Function){

        if (document){
            let loader = document.createElement("div");
            loader.setAttribute('class', 'loader-hor-wrapper');
            loader.setAttribute('style', 'padding-bottom:55px');
            loader.innerHTML = '<div class="loader loader-center"></div>';
            loader.appendChild(document.createTextNode(this._translateService.instant(data.text, (data.resolveParams) ? data.resolveParams.text : {})));

            (swal as any)({
                title:this._translateService.instant(data.title, (data.resolveParams) ? data.resolveParams.title : {}),
                text: this._translateService.instant(data.text, (data.resolveParams) ? data.resolveParams.text : {}),
                html:loader,
                showConfirmButton: false
            });

            httpRequest.subscribe(
                response => {
                    (swal as any).close();
                    responseFunc(response);
                },
                errors => {
                    (swal as any).close();
                    if (errorsFunc)
                        errorsFunc(errors);
                }
            )
        }
    }

    download(data:SweetAlertModel, downloadBtn:{url:string, title?:string}){
        let loader = document.createElement('div');
        loader.innerHTML = this._translateService.instant(data.text, (data.resolveParams) ? data.resolveParams.text : {}) + '<div><a href="https://dentaltap.s3.amazonaws.com/' + downloadBtn.url + '" target="_blank" class="swal-button swal-button--confirm btn btn-primary">' + this._translateService.instant('common.form.open') + '</a></div>';
        
        (swal as any)({
            title:this._translateService.instant(data.title, (data.resolveParams) ? data.resolveParams.title : {}),
            icon: 'success',
            customClass:'swal-with-icon-success',
            text:data.text,
            showConfirmButton: false,
            html:loader
        })
    }
/*
    */

}
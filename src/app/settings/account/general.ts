import { Component, Input, OnChanges, OnInit, EventEmitter } from '@angular/core';

import {UserModel} from './../../common/models/user/main';

import {AccountService} from './service';

import * as Languages from './../../../../public/i18n/languages/index.json';

import {TranslateService} from '@ngx-translate/core';


import {FormBuilder, FormGroup, FormControl, Validators, NgControl} from '@angular/forms';

import {ValidationService} from './../../common/modules/validation';

import { UploadOutput, UploadInput, UploadFile, humanizeBytes } from 'ngx-uploader';

import {AuthorizationService} from './../../common/services/authorization';

import {ConfigService, API_PREFFIX} from './../../common/services/config';

import { environment } from './../../../environments/environment';

@Component({
    selector: 'account-general',
    templateUrl: 'general.html'
})
export class AccountGeneralComponent implements OnInit, OnChanges {


    @Input()
    account:UserModel = {};

    isLoaded = false;

    timezones:Array<{value:number, text:string}>=[];

    languages:any = Languages;

    isSaving = false;

    isPhotoUploading = false;

    SVGForeignObjectElement:FormGroup;

    formData: FormData;
    uploadFiles: UploadFile[];
    uploadInput: EventEmitter<UploadInput>;
    
    humanizeBytes: Function;
    dragOver: boolean;

    environmentConfig = environment;

    orgId:any;

    language:any;

    form:FormGroup;

    constructor(private fb:FormBuilder, private configService:ConfigService, private authService:AuthorizationService, private accountService:AccountService, private translateService:TranslateService){

        this.form = this.fb.group({
            fullname:['', ValidationService.requiredValidator],
            phone:['', ValidationService.requiredValidator],
            address:[''],
            timezone_offset:[''],
            language:['', ValidationService.requiredValidator]
        });

        this.orgId = this.configService.defaults.organization_id;
        this.language = this.configService.defaults.language;

        this.uploadInput = new EventEmitter<UploadInput>();
        this.humanizeBytes = humanizeBytes;

    }


    ngOnChanges(){
        if (this.account){
            if (this.account['fullname']){
                this.isLoaded = true;
            }
            

            this.form.controls['fullname'].setValue(this.account['fullname']);
            this.form.controls['phone'].setValue(this.account['phone']);
            this.form.controls['address'].setValue(this.account['address']);
            this.form.controls['timezone_offset'].setValue(this.account['timezone_offset']);
            this.form.controls['language'].setValue(this.account['language']);
        }
    }

    ngOnInit(){

        this.accountService.getTimeZones(this.translateService.currentLang).subscribe(
            response => {
                this.timezones = response;
            }
        )

    }

     onUploadOutput(output: UploadOutput): void {

        if (output.type === 'allAddedToQueue') {
            const event: UploadInput = {
                type: 'uploadAll',
                url: API_PREFFIX+'/account/photo',
                method: 'POST',
                headers:{authorization:this.authService.getToken()}
            };
            this.uploadInput.emit(event);
        }

        if (output.type === 'start'){
            this.isPhotoUploading = true;
        }

        if (output.type === 'done'){
            this.isPhotoUploading = false;

            let file = output.file.response;

            this.account.photo = file['filename'];
        }
    }

    save(){
        this.isSaving = true;
        this.accountService.save(this.form.value).subscribe(
            response => {
                
                let defaults = this.configService.defaults;

                defaults.language = this.form.value.language;

                this.configService.init(defaults);
                
                this.isSaving = false;
            }
        );
    }
}
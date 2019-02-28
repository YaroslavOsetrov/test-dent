import { Component, OnInit, EventEmitter } from '@angular/core';

import {UserModel} from './../../common/models/user/main';

import {OrganizationService} from './service';

import * as Languages from './../../../../public/i18n/languages/index.json';

import {TranslateService} from '@ngx-translate/core';

import {FormBuilder, FormGroup, FormControl, Validators, NgControl} from '@angular/forms';

import {ValidationService} from './../../common/modules/validation';

import { UploadOutput, UploadInput, UploadFile, humanizeBytes } from 'ngx-uploader';

import {AuthorizationService} from './../../common/services/authorization';

import {ConfigService, API_PREFFIX} from './../../common/services/config';

import { environment } from '../../../environments/environment';

import * as hours from './../../../../public/json/hours.json';

import * as weekdays from './../.../../../../../public/json/weekdays.json';

@Component({
    selector: 'organization',
    templateUrl: 'component.html'
})
export class OrganizationComponent implements OnInit {

    isInitialLoaded = false;

    isSaving = false;

    timezones:Array<{value:number, text:string}>=[];

    currencies:Array<{value:number, text:string}>=[];

    organizationForm:FormGroup;

    organization:any;

    formData: FormData;
    uploadFiles: UploadFile[];
    uploadInput: EventEmitter<UploadInput>;
    
    humanizeBytes: Function;
    dragOver: boolean;

    environmentConfig = environment;

    orgId:any;

    hoursList:any;

    weekdays:any;

    isPhotoUploading = false;

    constructor(private authService:AuthorizationService, private fb:FormBuilder, private configService:ConfigService, private translateService:TranslateService, private organizationService:OrganizationService){

        let scheduler = this.configService.scheduler;

        
        this.uploadInput = new EventEmitter<UploadInput>();
        this.humanizeBytes = humanizeBytes;

        this.organizationForm = this.fb.group({
            name:[''],
            phone:[''],
            address:[''],
            url:[''],
            email:[''],
            start_hour:[scheduler.start_hour, ''],
            end_hour:[scheduler.end_hour, ''],
            first_day_index:[scheduler.first_day_index,''],
            tax:[this.configService.defaults.tax],
            currency_code:[''],
            timezone_offset:['']
        });

        let configCountry = this.configService.country;

        let hourType = (configCountry.locale_format.is_24h) ? '24h' : '12h';

        this.hoursList = hours[hourType];

        this.weekdays = weekdays['items'];


    }

    ngOnInit(){

        this.organizationService.get().subscribe(
            response => {

                this.organization = response;

                this.isInitialLoaded = true;
                this.organizationForm.controls.name.setValue(response.name);
                this.organizationForm.controls.phone.setValue(response.phone);
                this.organizationForm.controls.address.setValue(response.address);
                this.organizationForm.controls.url.setValue(response.url);
                this.organizationForm.controls.email.setValue(response.email);
                this.organizationForm.controls.currency_code.setValue(response.currency_code);
                this.organizationForm.controls.timezone_offset.setValue(response.timezone_offset);
            }
        );

        mixpanel.track("settingsClinicOpen");

        this.organizationService.getTimeZones(this.translateService.currentLang).subscribe(
            response => {
                this.timezones = response;
            }
        );

        this.organizationService.getCurrencies(this.translateService.currentLang).subscribe(
            response => {
                this.currencies = response;
            }
        )

    }

    onUploadOutput(output: UploadOutput): void {

        if (output.type === 'allAddedToQueue') {
            const event: UploadInput = {
                type: 'uploadAll',
                url: API_PREFFIX+'/organization/photo',
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

            this.organization.photo = file['filename'];
        }
    }

    save(){

        if (!this.organizationForm.valid)
            return false;

        this.isSaving = true;

        

        this.configService.init({
            country_code:this.configService.defaults.country_code,
            currency_code:this.organizationForm.value.currency_code,
            timezone_offset:this.organizationForm.value.timezone_offset,
            language:this.configService.defaults.language,
            tax:Number(this.organizationForm.value.tax),
            organization_id:this.configService.defaults.organization_id
        })

        let defaultScheduler = this.configService.scheduler;

        defaultScheduler.start_hour = this.organizationForm.value.start_hour;
        defaultScheduler.end_hour = this.organizationForm.value.end_hour;
        defaultScheduler.first_day_index = this.organizationForm.value.first_day_index;

        this.configService.scheduler = defaultScheduler;

        this.organizationService.save(this.organizationForm.value).subscribe(
            response => {
                this.isSaving = false;
            }, errors => {
                this.isSaving = false;
            }
        );


        
    }

}
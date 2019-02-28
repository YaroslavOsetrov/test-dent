import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';

import {SubscriptionService} from './service';

import {Router} from '@angular/router';

import {OrganizationService} from './../organization/service';

import {SubscriptionModel} from './../../common/models/organization/subscription';

import {ConfigService} from './../../common/services/config';

import {TranslateService} from '@ngx-translate/core';

import {MyCurrencyPipe} from './../../common/pipes';

import {SweetAlertService} from '@common/services/sweetalert';

import {PatientService} from './../../patients/patients.service';

@Component({
    selector: 'subscription',
    styleUrls:['styles.less'],
    templateUrl: 'component.html'
})
export class SubscriptionComponent implements OnInit {

    subscription:SubscriptionModel;

    @ViewChild('createModal') createModal:any;

    organization:any;

    localeFormat:any;

    isInitialLoaded = false;

    translateParams = {};

    limitDefaults = {
        sms_count:500,
        users_count:15,
        storage_size:1000
    };

    serviceUnitPrices:any;

    isLoadingRecharge:boolean = false;

    subscriptionPayments:any = [];

    subscriptionCurrencyCode:string = '';

    users = [];

    limits = {
        user:30,
        sms:500,
        storage:1000
    }

    patientStats:any;

    constructor(private configService:ConfigService, 
                private myCurrencyPipe:MyCurrencyPipe,
                private translateService:TranslateService,
                private _patientService:PatientService,
                private router:Router,
                private _swalService:SweetAlertService,
                private subscriptionService:SubscriptionService, 
                private organizationService:OrganizationService){

        this.localeFormat = this.configService.country.locale_format;

        this.users = this.configService.users;
    }

    ngOnInit(){

        mixpanel.track("settingsSubscriptionOpen");

        this._patientService.getStats().subscribe(
            response => {
                this.patientStats = response;
            }
        )

        this.organizationService.get().subscribe(
            response => {
                this.organization = response;

                this.subscription = this.organization.organization_subscription;

                this.subscriptionCurrencyCode = this.organization.organization_subscription.currency_code;

                this.translateParams = {
                    storageSize:this.organization.organization_limit.storage_size_free,
                    smsSize:this.organization.organization_limit.sms_count
                };

                this.finalizedLoading([this.organization, this.serviceUnitPrices]);
            }
        );

        this.subscriptionService.getPrice().subscribe(
            response => {
                this.serviceUnitPrices = response;

                this.finalizedLoading([this.organization, this.serviceUnitPrices]);
            }
        );

        this.subscriptionService.getPayments().subscribe(
            response => {
                this.subscriptionPayments = response;
            }
        )
    }

    private finalizedLoading(array){
        let isAll = true;

        for (let i = 0; i<array.length; i++){
            if (!array[i]){
                isAll = false;
                break;
            }
        }
        if (isAll)
            this.isInitialLoaded = true;

    }

    onSubscriptionChanged(data){

        this.organization['organization_subscription'] = data['subscription'];
        this.organization['stripe_id'] = data['stripe_customer']['id'];
    }

    addUser(){
         if (!this.organization['stripe_id']){
            this.createModal.show();
            return;
        }

        this.router.navigate(['../../collaboration']);

    }

    addSMS(){

        if (!this.organization['stripe_id']){
            this.createModal.show();
            return;
        }

        let service = this.serviceUnitPrices['sms'];

        this._swalService.confirm({
            title:'settings.subscription.sms.confirm.title',
            text:'settings.subscription.sms.confirm.descr',
            resolveParams:{
                text:{
                    number:service.units, 
                    amt:this.myCurrencyPipe.transform(service.price, this.subscriptionCurrencyCode)
                }
            }
        }).then(confirmed => {

            this._swalService.loader({
                title:'wait',
                text: 'wait'
            }, this.subscriptionService.addSMS(), (response) => {

                this.organization.organization_limit.sms_count += service.units;
                this.subscriptionPayments.unshift(response);

                this._swalService.message({
                    title:'Added!',
                    text:'added.success',
                    type:'success'
                })

            }, (errors) => {
                this._swalService.message({
                    title:'form.err',
                    text:errors.message,
                    type:'error'
                })
            });

        })
    }

    recharge(){
        
        this.isLoadingRecharge = true;
        this.subscriptionService.recharge().subscribe(
            reponse => {
                this.isLoadingRecharge = false;
                this.organization.organization_subscription.is_card_error = false;
                this.organization.organization_subscription.renew_attempts = 0;

                this._swalService.message({
                    title:'renewed',
                    text:'renewed.success',
                    type:'success'
                });
            },
            errors => {
                this.isLoadingRecharge = false;
                this._swalService.message({
                    title:'form.err',
                    text:errors.message,
                    type:'error'
                });
            }
        )

    }

    addStorage(){

        if (!this.organization['stripe_id']){
            this.createModal.show();
            return;
        }

        let service = this.serviceUnitPrices['storage'];

        this._swalService.confirm({
            title:'settings.subscription.storage.confirm.title',
            text:'settings.subscription.storage.confirm.descr',
            resolveParams:{
                text:{
                    number:service.units, 
                    amt:this.myCurrencyPipe.transform(service.price, this.subscriptionCurrencyCode)
                }
            }
        }).then(confirmed => {

            this._swalService.loader({
                title:'wait',
                text: 'wait'
            }, this.subscriptionService.addStorage(), (response) => {

                this.organization.organization_limit.storage_size_free += service.units;
                this.subscriptionPayments.unshift(response);

                this._swalService.message({
                    title:'Added!',
                    text:'added.success',
                    type:'success'
                })

            }, (errors) => {
                this._swalService.message({
                    title:'form.err',
                    text:errors.message,
                    type:'error'
                })
            });

        })
    }

}

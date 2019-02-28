import { Component, OnInit, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import {FormBuilder, FormGroup} from '@angular/forms';;

import {SubscriptionService} from './../service';

import {TranslateService} from '@ngx-translate/core';

import {OrganizationModel} from './../../../common/models/organization/main';

import {CreditCardModel} from './../../../common/models/organization/subscription';

import {SweetAlertService} from '@common/services/sweetalert';

declare var Stripe:any;

@Component({
    selector: 'create-modal',
    templateUrl: 'component.html',
    exportAs:'createModal'
})
export class CreateModalComponent implements OnInit {

    @ViewChild('createModal') createModal;

    private _organization:OrganizationModel = {};

    get organization():OrganizationModel{
        return this._organization;
    }

    isLoading:boolean = false;

    subscriptionCurrencyCode:string = '';

    @Output('subscriptionChanged') subscriptionChanged:EventEmitter<any> = new EventEmitter<any>();

    @Input('organization') 
    set organization(value:OrganizationModel){
        this._organization = value;
        if (value != null){
            if (value.hasOwnProperty('organization_subscription')){

                this.subscription.monthly_fee = this.calcPrice(value['organization_subscription']['monthly_fee_base'], value['organization_limit']['users_count']);

                this.subscription.users_count = value['organization_limit']['users_count'];

                this.subscriptionCurrencyCode = value['organization_subscription']['currency_code'];
            }
        }
    }

    subscription:{
        card:CreditCardModel,
        users_count:number,
        monthly_fee:number
    } = {
        card:{
            cvv:'',number:'',type:null,expire:'',owner:''
        },
        users_count:1,
        monthly_fee:0
    };

    constructor(private translateService:TranslateService, private _swalService:SweetAlertService, private subscriptionService:SubscriptionService){

    }
    ngOnInit(){


    }



    show(){
        this.createModal.show();
        mixpanel.track("settingsSubscriptionCardModalOpen");
    }

    countChange(event){
        let count = event;

        let newPrice = this.calcPrice(this.organization.organization_subscription['monthly_fee_base'], count);
        

        this.subscription.monthly_fee = newPrice;
    }

    private calcPrice(base_fee, count){
        let newPrice = base_fee;

        for (let i = 2; i<= count; i++){
            newPrice += base_fee;
        }

        return newPrice;
    }

    onSubmit(){

        mixpanel.track("settingsSubscriptionCardSave");
        
        let expire = {
            month:this.subscription.card.expire.split('/')[0],
            year:this.subscription.card.expire.split('/')[1]
        };

        this.isLoading = true;

        Stripe.card.createToken({
            number: this.subscription.card.number,
            cvc: this.subscription.card.cvv,
            exp_month: expire.month,
            exp_year: expire.year
        }, (status, response) => {
            
            if (response.error){
                this.isLoading = false;
                return;
            }
                
            if (this.organization.stripe_id){
                this.subscriptionService.save({stripe_token:(response.error) ? null : response.id, users_count:this.subscription.users_count}).subscribe(
                    response => {

                        this.subscription.card = {
                            number:'',type:null,expire:'',owner:'', cvv:''
                        }
                        this.subscriptionChanged.emit({subscription:response['subscription'], stripe_customer:response['stripe_customer']});
                        
                        this.createModal.hide();
                        this.isLoading = false;
                    },
                    errors => {
                        this.isLoading = false;

                        this._swalService.message({
                            title:'common.form.err',
                            text:'common.errors.'+errors.message,
                            type:'error'
                        });
                    }
                )
            }else{

                let token = response.id;

                this.subscriptionService.create({stripe_token:token, users_count:this.subscription.users_count}).subscribe(
                    response => {
                        
                        this.organization.organization_subscription = response['subscription'];
                        this.subscription.card = {
                            number:'',type:null,expire:'',owner:'', cvv:''
                        }
                        this.subscriptionChanged.emit({subscription:response['subscription'], stripe_customer:response['stripe_customer']});
                        this.createModal.hide();

                        this.isLoading = false;
                    },
                    errors => {
                        this.isLoading = false;
                        this._swalService.message({
                            title:'common.form.err',
                            text:'common.errors.'+errors.message,
                            type:'error'
                        });
                    }
                )

            }
        });

    }

    detectCardType(number) {
        
        let regVisa = /^4[0-9]{12}(?:[0-9]{3})?$/g;
        let regMaster = /^5[1-5][0-9]{14}$/g;
        let regExpress = /^3[47][0-9]{13}$/g;
        let regDiners = /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/g;
        let regDiscover = /^6(?:011|5[0-9]{2})[0-9]{12}$/g;
        let regJCB= /^(?:2131|1800|35\\d{3})\\d{11}$/g;

        number = number.replace(/-/g, '').toString();
        if(regVisa.test(number))
            this.subscription.card.type =  "visa";
        else if (regMaster.test(number))
            this.subscription.card.type =  "mastercard";
        else  if (regExpress.test(number))
            this.subscription.card.type =  "aexpress";
        else if (regDiners.test(number))
            this.subscription.card.type =  "diners";
        else if (regDiscover.test(number))
            this.subscription.card.type =  "discover";
        else   if (regJCB.test(number))
            this.subscription.card.type =  "jcb";
        else
            this.subscription.card.type = null;

    }

}
import { Component, OnChanges, ViewChild, Output, Input, EventEmitter } from '@angular/core';

import {AppointmentModel} from './../../common/models/appointment/main';

import {PatientInvoiceModel} from './../../common/models/user/patient/invoice';

import {ConfigService} from './../../common/services/config';

import {BillingService} from './../../patients/profile/practice/billing/service';

import {TranslateService} from '@ngx-translate/core';

import {OrganizationNotificationService} from './../../settings/templates/service';

import * as moment from 'moment';

@Component({
    selector: 'invoices-table',
    templateUrl: 'invoicesTable.html'
})
export class InvoicesTableComponent implements OnChanges {


    @Input() 
    appointment:AppointmentModel = {patient_id:null};

    @Output() 
    openInvoice:EventEmitter<any> = new EventEmitter<any>();

    @Output()
    openCreateInvoice:EventEmitter<any> = new EventEmitter<any>();

    @Output()
    invoiceAdded = new EventEmitter<any>();

    @Output()
    paymentAdded = new EventEmitter<any>();

    appointmentInvoices:Array<PatientInvoiceModel> = [];

    @Output()
    invoiceDeleted = new EventEmitter<any>();

    isLoaded = false;

    constructor(private billingService:BillingService, private configService:ConfigService){

    }

    ngOnChanges(){

        if (this.appointment){
            this.isLoaded = false;

            this.billingService.getApptInvoices(this.appointment.patient_id, this.appointment.id).subscribe(
                response => {
                    this.isLoaded = true;

                    this.appointmentInvoices = response;
                }
            )
        }
    }
    


    getTotalAmt(invoice:PatientInvoiceModel){
        return invoice.total_amt+invoice.tax*invoice.total_amt/100-invoice.discount*invoice.total_amt/100;
    }
    getDebts(invoice:PatientInvoiceModel){
        return this.getTotalAmt(invoice)-invoice.payed_amt;
    }

    getStatus(invoice:PatientInvoiceModel){
        return this.billingService.getInvoiceStatus(invoice);
    }

    onInvoiceDeleted(invoiceDeleted){
        this.appointmentInvoices = this.appointmentInvoices.filter(
            invoice => invoice.id !== invoiceDeleted.id
        );

        this.paymentAdded.emit({
            invoice_id:invoiceDeleted['id'], 
            isPaid:true,
            data:invoiceDeleted,
            date:moment(invoiceDeleted['expire_date'] || this.appointment.date || invoiceDeleted['createdAt']).format('YYYY-MM-DD')
        });
    }

    onPaymentDeleted(payment){

    }

    onPaymentAdded(payment){

        let isPaid = false;
        let invoice = null;
        this.appointmentInvoices.forEach((row) => {

            if (payment['invoice_id'] == row['id']){
                invoice = row;
                isPaid = (row['total_amt'] + row['tax']*row['total_amt']/100 - row['discount']*row['total_amt']/100 -row['payed_amt']) <= 0;
            }

        })

        if (!invoice){
            invoice = {};
            invoice['expire_date'] = payment['createdAt'];
        }
        
        this.paymentAdded.emit({
            invoice_id:payment['invoice_id'], 
            isPaid:isPaid,
            data:payment,
            date:moment(invoice['expire_date'] || invoice['createdAt']).format('YYYY-MM-DD')
        });
    } 

    onInvoiceCreated(invoice){
        this.invoiceAdded.emit(invoice);
        this.appointmentInvoices.push(invoice);
    }


    createInvoice(){
        this.openCreateInvoice.emit();
    }

}
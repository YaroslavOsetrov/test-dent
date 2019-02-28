export class PatientInvoiceModel{
    id?:string;
    patient_id?:string;
    appointment_id?:string;
    appointment_date?:string;
    internal_number?:string;
    code?:string;
    expire_date?:string;
    total_amt?:number;
    payed_amt?:number;
    discount?:number;
    tax?:number;
    comment?:string;
    organization_id?:number;
    create_user_id?:string;
    invoice_procedures?:any;
    invoice_payments?:any;
    createdAt?:any;
    code_f?:any;
    createdAt_f?:any;
    expire_date_f?:any;

    appointment?:any;
}

export class PatientInvoicePaymentModel{
    id?:any;
    invoice_id?:any;
    paid_amt?:any;
    payment_code?:any;
    organization_id?:any;
    create_user_id?:any;
}
import {UserModel} from './../main';

import {AppointmentModel} from './../../appointment/main';
export class PatientModel{
    id?:any;
    user_id?:any;
    organization_id?:any;
    card_number?:any;
    is_archived?:any;
    internal_number?:any;
    balance?:any;
    phone_additional?:any;
    total_debts?:any;
    total_invoices?:any;
    create_user_id?:any;
    discount_percent?:any;
    dental_chart?:any;
    is_child?:any;

    document_number?:any;
    document_issued?:any;
    document_expired?:any;
    document_authority?:any;
    reference_from?:any;
    email?:any;
    custom_fields?:any;

    patient_user?:UserModel;
    patient_appointments?:Array<AppointmentModel>;
    patient_accesses?:any;
    
    patient_notes:Array<any>;
}
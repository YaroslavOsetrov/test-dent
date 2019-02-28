import { PatientModel } from './../user/patient/main';
import { PatientProcedureModel } from './../user/patient/procedure';
import { UserModel } from './../user/main';

export class AppointmentModel{

    id?:any;
    patient_id?:any;
    provider_id?:any;
    section_index?:any;
    section_sub_index?:any;
    date?:any;
    start_time?:any;
    section_id?:any;
    end_time?:any;
    is_confirmed?:any;
    is_completed?:any;
    is_deleted?:any;
    note?:any;
    organization_id?:any;
    create_user_id?:any;
    notify_create?:any;
    notify_before?:any;

    provider?:UserModel;

    widget?:any;

    start?:any;
    end?:any;
    source?:any;

    patient?:PatientModel;
    appointment_notification?:any;

    appointment_procedures?:Array<PatientProcedureModel>;

}
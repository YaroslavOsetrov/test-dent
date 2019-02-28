import {Table, Column, Model, HasOne, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {User, UserWeb} from './../user/main';

import {Organization} from './../organization/main';

import {OrganizationOffice, OrganizationOfficeRoom} from './../organization/office';

import {AppointmentExam} from './exam';
import {AppointmentNote} from './note';

import {Patient} from './../user/patient/main';
import {PatientInvoice} from './../user/patient/invoice/main';

import {PatientRichNote} from './../user/patient/note';


import {PatientProcedure, PatientProcedureWeb} from './../user/patient/procedure';


import {AppointmentNotification, AppointmentNotificationWeb} from './notification';

@Table({
    timestamps: true
})
export class Appointment extends Model<Appointment> {

    create_note(appt:any){

        appt.appointment_id = this.id;
        return AppointmentNote.create<AppointmentNote>(appt);

    }

    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false
    })
    id:string;

    @ForeignKey(()=> Patient)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    patient_id:string;

    @ForeignKey(()=> User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    provider_id:string;


    @Column({
        type: 'TINYINT',
        allowNull: false,
        defaultValue:0
    })
    section_id:number;

    @Column({
        type: 'TINYINT',
        allowNull: false,
        defaultValue:0
    })
    section_sub_index:number;
    @Column({
        type: 'TINYINT',
        allowNull: false,
        defaultValue:0
    })
    section_index:number;

    @Column({
        type: DataType.DATEONLY,
        allowNull: false
    })
    date:string;

    @ForeignKey(()=> OrganizationOffice)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    office_id:string;

    @ForeignKey(()=> OrganizationOfficeRoom)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    room_id:string;

    @Column({
        type: DataType.TIME,
        allowNull: false
    })
    start_time:string;

    @Column({
        type: DataType.TIME,
        allowNull: false
    })
    end_time:string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    is_confirmed:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    is_completed:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    is_deleted:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    is_noshow:boolean;

    @Column({
        type: DataType.STRING(100),
        allowNull: true
    })
    note:string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    notify_create:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    notify_create_sent:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    notify_before:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    notify_before_sent:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    notify_delete:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    notify_delete_sent:boolean;

    @ForeignKey(()=> Organization)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    organization_id:number;

    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    create_user_id:string;

    @HasMany(() => AppointmentExam)
    appointment_exams:Array<AppointmentExam>;

    @HasOne(() => AppointmentNote)
    appointment_note:AppointmentNote;

    @HasMany(()=>PatientInvoice)
    patient_invoice:PatientInvoice;

    @HasMany(() => PatientProcedure)
    appointment_procedures:Array<PatientProcedure>;

    appointment_procedures_sum:number;

    @BelongsTo(() => Patient)
    patient:Patient;

    @BelongsTo(() => Organization)
    organization:Organization;

    @BelongsTo(() => User)
    provider:User;

    @HasMany(() => PatientRichNote)
    rich_notes:Array<PatientRichNote>;
}

export class AppointmentWeb{

    id?:any;
    patient_id?:any;
    provider_id?:any;
    section_index?:any;
    section_sub_index?:any;
    date?:any;
    start_time?:any;
    end_time?:any;
    is_confirmed?:any;
    is_completed?:any;
    is_deleted?:any;
    note?:any;
    organization_id?:any;
    create_user_id?:any;
    notify_create?:any;
    notify_before?:any;

    provider?:UserWeb;

    start?:any;
    end?:any;
    source?:any;

    patient?:Patient;
    appointment_notification?:AppointmentNotificationWeb;

    appointment_procedures?:Array<PatientProcedureWeb>;

}
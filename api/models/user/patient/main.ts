import {Table, Column, Model, ForeignKey, BelongsTo, HasMany, HasOne, DataType, AllowNull, Default, Length} from 'sequelize-typescript';

import {Appointment, AppointmentWeb} from './../../appointment/main';
import {User, UserWeb} from './../main';
import {Organization} from './../../organization/main';

import {PatientAccess} from './access';

import {PatientRichNote, PatientNote} from './note';

import {PatientInvoice} from './invoice/main';


@Table({
    timestamps:false
})
export class Patient extends Model<Patient> {

    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false
    })
    id:string;

    @ForeignKey(() => User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    user_id:string;

    @ForeignKey(() => Organization)
    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    organization_id:number;

    @Column({
        type:DataType.STRING(50),
        allowNull: true
    })
    card_number:string;

    @Column({
        type:'TINYINT',
        allowNull: false,
        defaultValue:0
    })
    discount_percent:number;

    @Column({
        type:DataType.INTEGER,
        allowNull: false,
        defaultValue:0
    })
    internal_number:number;

    @Column({
        type: DataType.STRING(20),
        allowNull: true
    })
    phone_additional:string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    is_archived:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    is_child:boolean;
    
    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false,
        defaultValue:0
    })
    balance:number;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false,
        defaultValue:0
    })
    total_debts:number;

     @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false,
        defaultValue:0
    })
    total_invoices:number;

    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    create_user_id:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: false
    })
    dental_chart:string;

    @Column({
        type:DataType.STRING(50),
        allowNull: true
    })
    document_number:string;

    @Column({
        type:DataType.DATEONLY,
        allowNull: true
    })
    document_issued:string;

    @Column({
        type:DataType.DATEONLY,
        allowNull: true
    })
    document_expired:string;

    @Column({
        type:DataType.STRING(100),
        allowNull: true
    })
    document_authority:string;

    @Column({
        type:DataType.STRING(100),
        allowNull: true
    })
    reference_from:string;

    @Column({
        type:DataType.STRING(256),
        allowNull: true
    })
    email:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: false
    })
    custom_fields:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: false
    })
    allergies:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: false
    })
    medications:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: false
    })
    urgent:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: false
    })
    past_ill:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: false
    })
    current_ill:string;


    @BelongsTo(() => User)
    patient_user:User;

    @HasMany(() => Appointment)
    patient_appointments:Appointment[];

    @HasMany(() => PatientRichNote)
    patient_notes:PatientRichNote[];

    @HasMany(() => PatientNote)
    patient_notes_office:PatientNote[];

    @HasMany(() => PatientAccess)
    patient_accesses:PatientAccess[];

    @HasMany(() => PatientInvoice)
    patient_invoices:PatientInvoice[];
}

export class PatientWeb{
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

    patient_user?:UserWeb;
    patient_appointments?:Array<AppointmentWeb>;
    patient_accesses?:any;
    
    patient_notes:Array<any>;
}
import {Table, Column, Model, ForeignKey, BelongsTo, HasMany, HasOne, DataType, AllowNull, Default, Length} from 'sequelize-typescript';


import {PatientInvoice} from './main';

import {Patient} from './../main';

import {User} from './../../main';

@Table({
    timestamps:true
})
export class PatientInvoicePayment extends Model<PatientInvoicePayment> {

    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false
    })
    id:string;

    @ForeignKey(()=> PatientInvoice)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    invoice_id:string;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false,
    })
    paid_amt:number;

    @Column({
        type: DataType.STRING(20),
        allowNull: true,
    })
    payment_code:string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    organization_id:number;

    @ForeignKey(()=> Patient)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    patient_id:string;

    @ForeignKey(() => User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    create_user_id:string;

}

export class PatientInvoicePaymentWeb{
    id?:any;
    invoice_id?:any;
    paid_amt?:any;
    payment_code?:any;
    organization_id?:any;
    create_user_id?:any;
}
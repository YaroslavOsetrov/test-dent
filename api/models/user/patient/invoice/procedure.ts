import {Table, Column, Model, ForeignKey, BelongsTo, HasMany, HasOne, DataType, AllowNull, Default, Length} from 'sequelize-typescript';


import {PatientInvoice} from './main';

import {PatientProcedure} from './../procedure';

@Table({
    timestamps:true
})
export class PatientInvoiceProcedure extends Model<PatientInvoiceProcedure> {

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
        allowNull: false
    })
    invoice_id:string;

    @ForeignKey(() => PatientProcedure)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    procedure_id:string;

    @Column({
        type: 'TINYINT',
        allowNull: false,
        defaultValue:1
    })
    qty:number;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false,
    })
    fee:number;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false,
    })
    fee_adj:number;

    @BelongsTo(() => PatientInvoice)
    patient_invoice:PatientInvoice;

    @BelongsTo(() => PatientProcedure)
    patient_procedure:PatientProcedure;
}
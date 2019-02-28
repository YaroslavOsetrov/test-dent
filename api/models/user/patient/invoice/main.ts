import {Table, Column, Model, ForeignKey, BelongsTo, HasMany, HasOne, DataType, AllowNull, Default, Length} from 'sequelize-typescript';


import {Patient} from './../main';

import {PatientProcedure} from './../procedure';
import {PatientInvoicePayment} from './payment';

import {Appointment} from './../../../appointment/main';

@Table({
    timestamps:true
})
export class PatientInvoice extends Model<PatientInvoice> {


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
        allowNull: false
    })
    patient_id:string;

    @ForeignKey(()=> Appointment)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    appointment_id:string;

    @Column({
        type: DataType.DATEONLY,
        allowNull: true
    })
    appointment_date:string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    internal_number:number;

    @Column({
        type: DataType.STRING(100),
        allowNull: true
    })
    code:string;

    @Column({
        type: DataType.DATEONLY,
        allowNull: true
    })
    expire_date:string;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false,
        defaultValue:0
    })
    total_amt:number;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false,
        defaultValue:0
    })
    payed_amt:number;

    @Column({
        type: 'TINYINT',
        allowNull: false,
        defaultValue:0
    })
    discount:number;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false,
        defaultValue:0
    })
    tax:number;

    @Column({
        type: DataType.STRING(300),
        allowNull: true
    })
    comment:string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    organization_id:string;

    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    create_user_id:string;

    @HasMany(()=>PatientProcedure)
    invoice_procedures:Array<PatientProcedure>;

    @HasMany(()=>PatientInvoicePayment)
    invoice_payments:Array<PatientInvoicePayment>;
    
    @BelongsTo(() => Appointment)
    appointment:Appointment;

    @BelongsTo(() => Patient)
    patient:Patient;

    add_payment(payment:PatientInvoicePayment){
        payment.invoice_id = this.id;
        return PatientInvoicePayment.create(payment);

    }

    get_payments(){
        return PatientInvoicePayment.findAll({
            where:{
                invoice_id:this.id
            },
            order:[['createdAt', 'DESC']]
        });
    }

    get_payment(id:string){
        return PatientInvoicePayment.findById(id, {
            where:{
                invoice_id:this.id
            }
        });
    }
}

export class PatientInvoiceWeb{
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

    createdAt_f?:any;
    expire_date_f?:any;

    appointment?:any;
}
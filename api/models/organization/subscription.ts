import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Organization} from './main';

import {OrganizationSubscriptionPayment} from './subscription_payment';

@Table({
    timestamps: false
})
export class OrganizationSubscription extends Model<OrganizationSubscription> {


    add_payment(payment:OrganizationSubscriptionPayment){
        
        payment.subscription_id = this.id;
        
        return new OrganizationSubscriptionPayment(payment).save();

    }

    get_payments(){

        return OrganizationSubscriptionPayment.findAll({
            where:{
                subscription_id:this.id,
            },
            order:[['createdAt', 'DESC']]
        });

    }

    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false
    })
    id:string;

    @ForeignKey(()=> Organization)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    organization_id:number;

    @Column({
        type: DataType.DATEONLY,
        allowNull: false,
        defaultValue:'CURRENT_TIMESTAMP'
    })
    expire_date:string;

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
    monthly_fee:number;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false,
        defaultValue:0
    })
    monthly_fee_base:number;

    @Column({
        type: DataType.STRING(10),
        allowNull: true
    })
    card_type:string;

    @Column({
        type: 'SMALLINT',
        allowNull: true
    })
    card_last4:number;

    @Column({
        type: DataType.CHAR(3),
        allowNull: true
    })
    currency_code:string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    available_sms:number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    is_card_error:boolean;

    @Column({
        type: 'TINYINT',
        allowNull: false,
        defaultValue:0
    })
    renew_attempts:number;

    @Column({
        type: DataType.STRING(4),
        allowNull: true
    })
    card_last_digits:string;

    @BelongsTo(() => Organization)
    organization:Organization;

    @HasMany(() => OrganizationSubscriptionPayment)
    subscription_payments:Array<OrganizationSubscriptionPayment>;

}

export class SubscriptionWeb{
    id?:any;
    organization_id?:any;
    expire_date?:any;
    balance?:any;
    monthly_fee?:any;
    monthly_fee_base?:any;
    currency_code?:any;
    available_sms?:any;
    is_card_error?:any;
    renew_attempts?:any;
    organization?:any;
    subscription_payments?:any;
}

export class CreditCardWeb{
    number?:any;
    type?:any;
    cvv?:any;
    owner?:any;
    expire?:any;
}


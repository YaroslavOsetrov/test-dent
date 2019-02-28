import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {OrganizationSubscription} from './subscription';

@Table({
    timestamps: true
})
export class OrganizationSubscriptionPayment extends Model<OrganizationSubscriptionPayment> {

    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false
    })
    id:string;

    @ForeignKey(()=> OrganizationSubscription)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        defaultValue: DataType.UUIDV4,
        allowNull: false
    })
    subscription_id:string;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false
    })
    amount:number;

    @Column({
        type: DataType.CHAR(3),
        allowNull: true
    })
    currency_code:string;

    @Column({
        type:DataType.STRING(30),
        allowNull: false
    })
    card_info:string;

    @Column({
        type: DataType.STRING(30),
        allowNull: true
    })
    payment_type:string;

    @BelongsTo(() => OrganizationSubscription)
    organization_subscription:OrganizationSubscription;

}
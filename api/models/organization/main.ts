import {Table, Column, Model, HasOne, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {User} from './../user/main';

import {OrganizationSubscription} from './subscription';
import {OrganizationLimit} from './limit';

import {OrganizationPrice} from './price';

import {OrganizationNotification} from './notification';

import {OrganizationEmailCampaign} from './email_campaign';

@Table({
    timestamps: true
})
export class Organization extends Model<Organization> {


    create_subscription(subscription:OrganizationSubscription){

        subscription.organization_id = this.id;

        return subscription.save();

    }

    create_price(price:OrganizationPrice){

        price.organization_id = this.id;
        return price.save();
    }

    create_notification(notification:OrganizationNotification){
        notification.organization_id = this.id;
        return notification.save();
    }

    create_limit(limit:OrganizationLimit){
        limit.organization_id = this.id;

        return limit.save();
    }

    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    })
    id:number;

    @Column({
        type: DataType.STRING(200),
        allowNull: true
    })
    name:string;

    @Column({
        type: DataType.STRING(20),
        allowNull: true
    })
    phone:string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue:0
    })
    timezone_offset:number;

    @Column({
        type: DataType.STRING(300),
        allowNull: true
    })
    address:string;

    @Column({
        type: DataType.STRING(50),
        allowNull: true
    })
    url:string;

    @Column({
        type: DataType.STRING(256),
        allowNull: true
    })
    email:string;

    @Column({
        type: DataType.CHAR(3),
        allowNull: true
    })
    currency_code:string;

    @Column({
        type: DataType.CHAR(2),
        allowNull: true
    })
    language:string;

    @Column({
        type: DataType.STRING(60),
        allowNull: true
    })
    photo:string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true
    })
    price_list_id:string;

    @ForeignKey(() => User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    create_user_id:string;

    @Column({
        allowNull: true,
        type:DataType.CHAR(5)
    })
    start_hour:string;
    
    @Column({
        allowNull: true,
        type:DataType.CHAR(5)
    })
    end_hour:string;

    @Column({
        allowNull:false,
        type:DataType.CHAR(2)
    })
    country_code:string;

    @Column({
        allowNull: true,
        type:DataType.STRING(50)
    })
    stripe_id:string;

    @Column({
        allowNull: true,
        defaultValue:0,
        type:DataType.DECIMAL(10,2)
    })
    tax:number;


    @BelongsTo(() => User)
    organization_user:User;

    @HasOne(() => OrganizationSubscription)
    organization_subscription:OrganizationSubscription;

    @HasOne(() => OrganizationEmailCampaign)
    organization_email_campaign:OrganizationEmailCampaign;

    @HasOne(() => OrganizationLimit)
    organization_limit:OrganizationLimit;

    @HasOne(() => OrganizationNotification)
    organization_notification:OrganizationNotification;

    @HasOne(() => OrganizationPrice)
    organization_price:OrganizationPrice;

}

export class OrganizationWeb{
    id?:any;
    name?:any;
    phone?:any;
    timezone_offset?:any;
    address?:any;
    url?:any;
    email?:any;
    currency_code?:any;
    language?:any;
    photo?:any;
    price_list_id?:any;
    create_user_id?:any;
    start_hour?:any;
    end_hour?:any;
    country_code?:any;
    stripe_id?:any;
    organization_user?:any;
    organization_subscription?:any;
    organization_limit?:any;
    organization_notification?:any;
    organization_price?:any;
}
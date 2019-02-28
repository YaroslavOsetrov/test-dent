/*import {Table, Column, Model, HasOne, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {User} from './../user/main';

import {OrganizationSubscription} from './subscription';
import {OrganizationLimit} from './limit';

import {OrganizationPrice} from './price';

import {OrganizationNotification} from './notification';

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
    id;

    @Column({
        type: DataType.STRING(200),
        allowNull: true
    })
    name;

    @Column({
        type: DataType.STRING(20),
        allowNull: true
    })
    phone;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue:0
    })
    timezone_offset;

    @Column({
        type: DataType.STRING(300),
        allowNull: true
    })
    address;

    @Column({
        type: DataType.STRING(50),
        allowNull: true
    })
    url;

    @Column({
        type: DataType.STRING(256),
        allowNull: true
    })
    email;

    @Column({
        type: DataType.CHAR(3),
        allowNull: true
    })
    currency_code;

    @Column({
        type: DataType.CHAR(2),
        allowNull: true
    })
    language;

    @Column({
        type: DataType.STRING(60),
        allowNull: true
    })
    photo;

    @Column({
        type: DataType.STRING(100),
        allowNull: true
    })
    price_list_id;

    @ForeignKey(() => User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    create_user_id;

    @Column({
        allowNull: true,
        type:DataType.CHAR(5)
    })
    start_hour;
    
    @Column({
        allowNull: true,
        type:DataType.CHAR(5)
    })
    end_hour;

    @Column({
        allowNull:false,
        type:DataType.CHAR(2)
    })
    country_code;

    @Column({
        allowNull: true,
        type:DataType.STRING(50)
    })
    stripe_id;

    @BelongsTo(() => User)
    organization_user;

    @HasOne(() => OrganizationSubscription)
    organization_subscription;

    @HasOne(() => OrganizationLimit)
    organization_limit;

    @HasOne(() => OrganizationNotification)
    organization_notification;

    @HasOne(() => OrganizationPrice)
    organization_price;

}
*/
export class OrganizationModel{

    id?;
    name?;
    phone?;
    timezone_offset?;
    address?;
    url?;
    email?;
    currency_code?;
    language?;
    photo?;
    price_list_id?;
    create_user_id?;
    start_hour?;
    end_hour?;
    country_code?;
    stripe_id?;
    organization_user?;
    organization_subscription?;
    organization_limit?;
    organization_notification?;
    organization_price?;

}
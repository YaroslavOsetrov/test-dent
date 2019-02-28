import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Organization} from './main';


@Table({
    timestamps: true
})
export class OrganizationNotification extends Model<OrganizationNotification> {

    @ForeignKey(()=> Organization)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    organization_id:number;

    @Column({
        type: DataType.STRING(200),
        allowNull: false
    })
    create_appt:string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:true
    })
    is_create_appt:string;

    @Column({
        type: DataType.STRING(200),
        allowNull: false
    })
    confirm_appt:string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:true
    })
    is_confirm_appt:string;

    @Column({
        type: DataType.STRING(200),
        allowNull: false
    })
    edit_appt:string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:true
    })
    is_edit_appt:string;

    @Column({
        type: DataType.STRING(200),
        allowNull: false
    })
    cancel_appt:string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:true
    })
    is_cancel_appt:string;

    @Column({
        type: DataType.STRING(200),
        allowNull: false
    })
    upcoming_birthday:string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:true
    })
    is_upcoming_birthday:string;

}

export class OrganizationNotificationWeb{
    
    organization_id?:any;
    create_appt?:any;
    confirm_appt?:any;
    edit_appt?:any;
    cancel_appt?:any;
}
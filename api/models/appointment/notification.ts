import {Table, Column, Model, HasOne, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Appointment} from './main';

import {User} from './../user/main';


@Table({
    timestamps: false
})
export class AppointmentNotification extends Model<AppointmentNotification> {

    @ForeignKey(() => Appointment)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey:true,
        allowNull: false
    })
    appointment_id:string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:true
    })
    notify_on_create:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:true
    })
    notify_before_appt:boolean;

}

export class AppointmentNotificationWeb{
    appointment_id?:any;
    notify_on_create?:any;
    notify_before_appt?:any;
}
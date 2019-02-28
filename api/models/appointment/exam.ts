import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Appointment} from './main';


@Table({
    timestamps: true
})
export class AppointmentExam extends Model<AppointmentExam> {

    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        allowNull: false
    })
    id:string;

    @ForeignKey(()=> Appointment)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    appointment_id:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: false
    })
    exam:string;

    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    create_user_id:string;

}
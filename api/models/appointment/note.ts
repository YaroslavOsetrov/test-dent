import {Table, Column, Model, HasOne, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Appointment} from './main';

import {User} from './../user/main';


@Table({
    timestamps: true
})
export class AppointmentNote extends Model<AppointmentNote> {

    @ForeignKey(() => Appointment)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    appointment_id:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: true
    })
    complaints:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: true
    })
    investigations:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: true
    })
    observations:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: true
    })
    diagnoses:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: true
    })
    treatments:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: true
    })
    recommendations:string;

    @BelongsTo(() => Appointment)
    appointment:Appointment;
}
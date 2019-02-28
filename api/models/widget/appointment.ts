import {Table, Column, Model, HasOne, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {User} from './../user/main';

import {Patient} from './../user/patient/main';

import {Organization} from './../organization/main';

import {OrganizationOffice, OrganizationOfficeRoom} from './../organization/office';

@Table({
    timestamps: false
})
export class WidgetAppointmentSettings extends Model<WidgetAppointmentSettings> {

    @ForeignKey(()=> Organization)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    organization_id:number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:true
    })
    is_enabled:string;

    @Column({
        type: DataType.STRING(200),
        allowNull: false
    })
    success_text:string;
}

@Table({
    timestamps: true
})
export class WidgetAppointmentRequest extends Model<WidgetAppointmentRequest> {

    @ForeignKey(() => User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
    })
    id:string;

    @ForeignKey(()=> Organization)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    organization_id:number;

    @Column({
        type:DataType.STRING(100),
        allowNull:false,
        validate:{
            len:[1,100]
        }
    })
    fullname:string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false
    })
    phone:string;

    @Column({
        type: DataType.DATEONLY,
        allowNull: false
    })
    date:string;

    @Column({
        type: DataType.TIME,
        allowNull: false
    })
    time:string;

    @ForeignKey(()=> OrganizationOffice)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    office_id:string;

    @ForeignKey(()=> OrganizationOfficeRoom)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    room_id:string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true
    })
    note:string;

    @ForeignKey(() => User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    provider_id:string;

    @ForeignKey(() => Patient)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    patient_id:string;

    @BelongsTo(() => Patient)
    patient:Patient;
}

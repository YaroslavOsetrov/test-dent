import {Table, Column, Model, BelongsTo, HasOne, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Patient} from './main';

import {User} from './../main';

@Table({
    timestamps: true
})
export class PatientLog extends Model<PatientLog> {

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

    @ForeignKey(()=> User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    create_user_id:string;

    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    resource_id:string;

    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    resource_id_sub:string;

    @Column({
        type: DataType.DATEONLY,
        allowNull: true
    })
    event_date:string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false
    })
    type:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: false,
        defaultValue:''
    })
    data:string;

}
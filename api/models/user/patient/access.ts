import {Table, PrimaryKey, Column, Model, BelongsToMany, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Patient} from './main';

import {User} from './../main';

@Table({
    timestamps: true
})
export class PatientAccess extends Model<PatientAccess> {

    @ForeignKey(()=> Patient)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    patient_id:string;

    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    user_id:string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:true
    })
    is_view:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:true
    })
    is_edit:boolean;

    @BelongsTo(() => Patient)
    patient:Patient;

}
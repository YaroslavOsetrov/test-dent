import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Patient} from './main';


@Table({
    timestamps: true
})
export class PatientExam extends Model<PatientExam> {

    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        allowNull: false
    })
    id:string;

    @ForeignKey(()=> Patient)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    patient_id:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: false
    })
    price_list:string;

    @BelongsTo(() => Patient)
    patient:Patient;

}
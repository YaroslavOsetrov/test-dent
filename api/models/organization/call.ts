import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Organization} from './main';

import {Patient} from './../user/patient/main';

@Table({
    timestamps: false
})
export class OrganizationCall extends Model<OrganizationCall> {

    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false
    })
    id:string;

    @ForeignKey(()=> Organization)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    organization_id:number;


    @ForeignKey(()=> Patient)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    patient_id:number;

     @Column({
        type: DataType.STRING,
        allowNull: false
    })
    status:number;

    @Column({
        type: DataType.TEXT,
        allowNull: false
    })
    patient_data:string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    is_showed:string;
}
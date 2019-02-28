import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Patient} from './main';


@Table({
    timestamps: true
})
export class PatientFile extends Model<PatientFile> {

    @Column({
        type: 'UNIQUEIDENTIFIER',
        defaultValue: DataType.UUIDV4,
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
    name:string;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false
    })
    size:number;

    @Column({
        type: DataType.STRING(10),
        allowNull: false
    })
    extension:string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false
    })
    url:string;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: false
    })
    tags:string;

    @Column({
        type:DataType.INTEGER,
        allowNull:false
    })
    organization_id:number;

    @Column({
        type:'UNIQUEIDENTIFIER',
        allowNull:false
    })
    create_user_id:string;

    @BelongsTo(() => Patient)
    patient:Patient;

}

export class PatientFileWeb{
    id?:any;
    patient_id?:any;
    name?:any;
    size?:any;
    url?:any;
    tags?:any;
    organization_id?:any;
    patient?:any;
}
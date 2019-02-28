import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Organization} from './main';

import {Patient} from './../user/patient/main';

@Table({
    timestamps: true
})
export class OrganizationOffice extends Model<OrganizationOffice> {

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

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    name:number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    is_deleted:boolean;

    @HasMany(() => OrganizationOfficeRoom)
    rooms:Array<OrganizationOfficeRoom>
}


@Table({
    timestamps: false
})
export class OrganizationOfficeRoom extends Model<OrganizationOfficeRoom> {

    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false
    })
    id:string;

    @ForeignKey(()=> OrganizationOffice)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    office_id:number;

     @Column({
        type: DataType.STRING,
        allowNull: false
    })
    name:number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    is_deleted:boolean;

    @BelongsTo(() => OrganizationOffice)
    office:OrganizationOffice;
}
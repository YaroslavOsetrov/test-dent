import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Organization} from './main';


@Table({
    timestamps: true
})
export class OrganizationTask extends Model<OrganizationTask> {

    @ForeignKey(()=> Organization)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    organization_id:number;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: false
    })
    tags:string;

}
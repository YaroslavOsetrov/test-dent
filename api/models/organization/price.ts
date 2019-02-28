import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Organization} from './main';


@Table({
    timestamps: true
})
export class OrganizationPrice extends Model<OrganizationPrice> {

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
    price_list:string;

    @BelongsTo(() => Organization)
    organization:Organization;

}
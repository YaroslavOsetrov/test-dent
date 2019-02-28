import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {OrganizationOffice} from './office';

import {OrganizationInventory} from './inventory';

@Table({
    timestamps: false
})
export class OrganizationInventoryOffice extends Model<OrganizationInventoryOffice> {


    @ForeignKey(()=> OrganizationInventory)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false
    })
    inventory_id:string;

    @ForeignKey(()=> OrganizationOffice)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false,
        primaryKey: true
    })
    office_id:string;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false
    })
    count:number;
}
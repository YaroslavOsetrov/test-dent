import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Organization} from './main';

import {OrganizationInventoryOffice} from './inventory_office';

import {OrganizationProcedureInventory} from './procedure_inventory';

@Table({
    timestamps: false
})
export class OrganizationInventory extends Model<OrganizationInventory> {

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
        type: DataType.INTEGER,
        allowNull: false
    })
    static_category_id:number;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    name:number;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    code:string;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false
    })
    count_one:number;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false
    })
    fee:number;

    @Column({
        type: DataType.STRING(6),
        allowNull: false
    })
    unit:string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    is_deleted:boolean;

    @HasMany(() => OrganizationInventoryOffice)
    offices:Array<OrganizationInventoryOffice>;


    @HasMany(() => OrganizationProcedureInventory)
    procedures:Array<OrganizationProcedureInventory>;

}
import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Organization} from './main';

import {OrganizationProcedureInventory} from './procedure_inventory';

@Table({
    timestamps: true
})
export class OrganizationProcedure extends Model<OrganizationProcedure> {

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
        primaryKey: true,
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
    code:string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    name:string;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull: false
    })
    fee:number;

    @BelongsTo(() => Organization)
    organization:Organization;

    @HasMany(() => OrganizationProcedureInventory)
    procedure_inventory:Array<OrganizationProcedureInventory>;

}
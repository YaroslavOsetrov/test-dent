import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Organization} from './main';

import {OrganizationProcedure} from './procedure';

import {OrganizationInventory} from './inventory';

@Table({
    timestamps: true
})
export class OrganizationProcedureInventory extends Model<OrganizationProcedureInventory> {

    @ForeignKey(()=> OrganizationProcedure)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false,
        primaryKey:true
    })
    procedure_id:string;

    @ForeignKey(()=> OrganizationInventory)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false,
        primaryKey:true
    })
    inventory_id:string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    qty:number;

    @BelongsTo(() => OrganizationProcedure)
    procedure:OrganizationProcedure;

    @BelongsTo(() => OrganizationInventory)
    inventory:OrganizationInventory;

}
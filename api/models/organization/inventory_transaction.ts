import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {OrganizationInventory} from './inventory';

import {OrganizationInventoryOffice} from './inventory_office';

import {Appointment} from './../appointment/main';

import {User} from './../user/main';

@Table({
    timestamps: false
})
export class OrganizationInventoryTransaction extends Model<OrganizationInventoryTransaction> {

    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false
    })
    id:string;

    @ForeignKey(()=> OrganizationInventory)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    inventory_id:string;

    @ForeignKey(()=> OrganizationInventoryOffice)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    office_id:string;

    @ForeignKey(()=> Appointment)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    appointment_id:string;

    @ForeignKey(()=> User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    create_user_id:string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    count:number;
}
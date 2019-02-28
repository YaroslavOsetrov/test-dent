import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Organization} from './main';

@Table({
    timestamps: false
})
export class OrganizationLimit extends Model<OrganizationLimit> {

    @ForeignKey(()=> Organization)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    organization_id:number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue:50
    })
    patients_count:number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue:200
    })
    storage_size_free:number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue:0
    })
    sms_count:number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue:0
    })
    users_count:number;

}
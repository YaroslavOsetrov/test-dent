import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Organization} from './main';

@Table({
    timestamps: true
})
export class OrganizationScheduler extends Model<OrganizationScheduler> {

    @ForeignKey(()=> Organization)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    organization_id:number;

    @Column({
        type: 'TINYINT',
        allowNull: false
    })
    start_hour:number;

    @Column({
        type: 'TINYINT',
        allowNull: false
    })
    end_hour:number;

    @Column({
        type: 'TINYINT',
        allowNull: false
    })
    slot_duration:number;

    @Column({
        type: 'TINYINT',
        allowNull: false
    })
    first_day_index:number;

    @Column({
        type: 'NVARCHAR(MAX)',
        allowNull: false
    })
    sections:string;

    @Column({
        type: 'NVARCHAR(100)',
        allowNull: true
    })
    hidden_days:string;

    @BelongsTo(() => Organization)
    organization:Organization;

}
import {Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, DataType, AllowNull, Default, Length} from 'sequelize-typescript';

import {Organization} from './main';

@Table({
    timestamps: true
})
export class OrganizationEmailCampaign extends Model<OrganizationEmailCampaign> {

    @ForeignKey(()=> Organization)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    organization_id:number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:true
    })
    is_subscribed:string;

}
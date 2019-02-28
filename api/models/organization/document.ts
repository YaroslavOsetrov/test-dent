import {Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, DataType, AllowNull, Default, Length} from 'sequelize-typescript';

import {Organization} from './main';

@Table({
    timestamps: true
})
export class OrganizationDocument extends Model<OrganizationDocument> {

    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: true
    })
    id:string;

    @ForeignKey(()=> Organization)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    organization_id:number;

    @Column({
        type: DataType.STRING(100),
        allowNull: false
    })
    title:string;

    @Column({
        type:'NVARCHAR(MAX)',
        allowNull: false
    })
    text:string;

}
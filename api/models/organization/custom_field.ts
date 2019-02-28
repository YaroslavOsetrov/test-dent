import {Table, Column, Model, BelongsTo, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Organization} from './main';

@Table({
    timestamps: false
})
export class OrganizationCustomField extends Model<OrganizationCustomField> {

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
        type: DataType.STRING(10),
        allowNull: false,
        validate:{
            isIn:[['DATE', 'TEXT', 'PHONE', 'ADDRESS']]
        }
    })
    field_type:string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false
    })
    field_name:string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false
    })
    field_name_internal:string;

    @BelongsTo(() => Organization)
    organization:Organization;

}
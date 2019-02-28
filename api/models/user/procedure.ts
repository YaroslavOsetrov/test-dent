import {Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, DataType, AllowNull, Default, Length} from 'sequelize-typescript';

import {User} from './main';

import {Organization} from './../organization/main';

@Table({
    timestamps: false
})
export class UserProcedure extends Model<UserProcedure> {

    @ForeignKey(() => User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false,
        primaryKey: true
    })
    user_id:string;

    @ForeignKey(()=> Organization)
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    organization_id:number;

    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false
    })
    procedure_index:number;

    @BelongsTo(() => User)
    user: User;

}
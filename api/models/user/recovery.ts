import {Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, DataType, AllowNull, Default, Length} from 'sequelize-typescript';

import {User} from './main';

@Table({
    timestamps: true
})
export class UserRecovery extends Model<UserRecovery> {


    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: true
    })
    id:string;

    @ForeignKey(() => User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    user_id:string;

}
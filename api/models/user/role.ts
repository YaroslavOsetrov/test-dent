import {Table, BelongsToMany, Column, Model, HasMany, DataType} from 'sequelize-typescript';

import {UserRole} from './user_role';
import {User} from './main';
@Table({
    timestamps: false
})
export class Role extends Model<Role> {

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        primaryKey: true
    })
    id:number;

    @Column({
        type: DataType.STRING(20)
    })
    code:string;

    @BelongsToMany(() => User, () => UserRole)
    users: User[];
}
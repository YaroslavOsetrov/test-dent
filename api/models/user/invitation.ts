import {Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, DataType, AllowNull, Default, Length} from 'sequelize-typescript';

import {Organization} from './../organization/main';

import {User} from './../user/main';

@Table({
    timestamps: true
})
export class UserInvitation extends Model<UserInvitation> {


    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: true
    })
    id:any;

    @ForeignKey(() => Organization)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    organization_id:any;


    @Column({
        type: DataType.STRING(256),
        allowNull: false,
        validate: {
            isEmail: true
        }
    })
    email:any;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    is_confirmed:any;


    @ForeignKey(() => User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    user_id:any;

    @BelongsTo(() => User)
    user: User

}

export class UserInvitationWeb{
    id?:any;
    organization_id?:any;
    email?:any;
    is_confirmed?:any;
}
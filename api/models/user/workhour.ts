import {Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, DataType, AllowNull, Default, Length} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt-nodejs';

import {Role}           from './role';
import {User}           from './main';

import {OrganizationOffice, OrganizationOfficeRoom} from './../organization/office';


@Table({
    timestamps: false
})
export class UserWorkhour extends Model<UserWorkhour> {


    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false
    })
    id:string;

    @ForeignKey(() => User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: false
    })
    user_id:string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    organization_id:number;

    @Column({
        type: 'TINYINT',
        allowNull: false
    })
    section_id:number;

    @Column({
        type: 'TINYINT',
        allowNull: false,
        defaultValue: 0
    })
    section_index:number;
    
    @Column({
        type: 'TINYINT',
        allowNull: false,
        defaultValue: 0
    })
    section_sub_index:number;

    @Column({
        type: DataType.DATEONLY,
        allowNull: false
    })
    date:string;

    @Column({
        type: DataType.TIME,
        allowNull: false
    })
    start_time:string;

    @Column({
        type: DataType.TIME,
        allowNull: false
    })
    end_time:string;

    @ForeignKey(()=> OrganizationOffice)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    office_id:string;

    @ForeignKey(()=> OrganizationOfficeRoom)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    room_id:string;

}
import {Table, Column, Model, BelongsTo, HasOne, HasMany, DataType, ForeignKey} from 'sequelize-typescript';

import {Organization} from './main';

import {User} from './../user/main';

@Table({
    timestamps: true
})
export class OrganizationLog extends Model<OrganizationLog> {

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

    @ForeignKey(()=> User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    user_id:string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false
    })
    type:string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue:''
    })
    data:string;

    @HasMany(() => OrganizationLogView)
    log_views:OrganizationLogView[];

}

@Table({
    timestamps: false
})
export class OrganizationLogView extends Model<OrganizationLogView>{

    @ForeignKey(()=> OrganizationLog)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true
    })
    log_id:string;

    @ForeignKey(()=> User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true
    })
    user_id:string;

    @BelongsTo(() => OrganizationLog)
    log_source:OrganizationLog;


}
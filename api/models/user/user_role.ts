
import {Table, Column, Model, BelongsTo, ForeignKey, HasOne, HasMany, DataType, AllowNull, Default, Length} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt-nodejs';

import {Role}           from './role';
import {User}           from './main';

@Table({
    timestamps: false
})
export class UserRole extends Model<UserRole> {


    @ForeignKey(() => User)
    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: true
    })
    user_id?:string;

    @ForeignKey(() => Role)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        primaryKey:true
    })
    role_id?:number;

     @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    allow_sharing?:boolean;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        primaryKey:true
    })
    organization_id?:number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    view_analytics?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    edit_price?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    edit_appt?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    view_patient?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    edit_payment?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    is_doctor?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    online_access?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    add_task?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    access_subscription?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    access_collaboration?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    access_templates?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    share_patient?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    edit_patient?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    delete_patient?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    create_patient?:boolean;
    
    /* Remove everything up but online_access and is_doctor*/
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    patients?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    appointments?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    patient_profile?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    patient_billing?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    patient_treatment?:boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    settings?:boolean;

    @BelongsTo(() => User)
    user:User;

}

export class UserRoleWeb{
    user_id?:any;
    role_id?:any;
    organization_id?:any;
    view_analytics?:any;
    edit_price?:any;
    edit_appt?:any;
    view_patient?:any;
    edit_payment?:any;
    is_doctor?:any;
    add_task?:any;
    access_subscription?:any;
    access_collaboration?:any;
    access_templates?:any;
    share_patient?:any;
    edit_patient?:any;
    delete_patient?:any;
    create_patient?:any;

    
    online_access?:any;
    patients?:any;
    appointments?:any;
    patient_profile?:any;
    patient_billing?:any;
    patient_treatment?:any;
    settings?:any;
    
}
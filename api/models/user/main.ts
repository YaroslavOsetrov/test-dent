import {Table, Column, Model, BelongsToMany, HasMany, HasOne, DataType, AllowNull, Default, Length} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt-nodejs';

import {UserRole, UserRoleWeb} from './user_role';
import {Role} from './role';
import {Organization} from './../organization/main';

import {Appointment} from './../appointment/main';

import {Patient} from './patient/main';

import {UserInvitation} from './invitation';

import {UserProcedure} from './procedure';

@Table({
    timestamps:true
})
export class User extends Model<User> {

    create_patient(patient:Patient){

        patient.user_id = this.id;

        return patient.save();

    }

    set_password(password:string){

        if (password.length < 6)
                return false;

            this.password_hash =  bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            return true;

    }

    check_password(password:string){
        return bcrypt.compareSync(password, this.password_hash);
    }

    add_to_role(role_id:number, organization_id:number, role_all?:boolean, prop?:any){
        
        if (!role_all){
            role_all = false;
        }

        if (!prop){

            prop = {
                is_doctor:true,
                online_access:true
            };
        }

        let user_role = new UserRole({
            role_id:role_id,
            user_id:this.id,
            organization_id:organization_id,
            view_analytics:role_all,
            edit_price:role_all,
            edit_appt:role_all,
            view_patient:role_all,
            edit_payment:role_all,
            is_doctor:role_all || prop.is_doctor,
            online_access:prop.online_access,
            add_task:role_all,
            access_subscription:role_all,
            access_collaboration:role_all,
            access_templates:role_all,
            allow_sharing:role_all,
            share_patient:role_all,
            edit_patient:role_all,
            delete_patient:role_all,
            create_patient:role_all,
            patients:true,
            appointments:true,
            patient_profile:true,
            patient_billing:true,
            patient_treatment:true,
            settings:true
        }).save();
        return user_role;

    }

    @Column({
        type: 'UNIQUEIDENTIFIER',
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false
    })
    id:string;

    @Column({
        type:DataType.STRING(100),
        allowNull:false,
        validate:{
            len:[1,100]
        }
    })
    fullname:string;

    @Column({
        type: DataType.DATEONLY,
        allowNull: true
    })
    birthday:string;

    @Column({
        allowNull: false,
        type: DataType.ENUM('M', 'F', 'O'),
        defaultValue: 'O'
    })
    sex:string;

    @Column({
        allowNull: true,
        type: DataType.STRING(60)
    })
    photo:string;

    @Column({
        allowNull: true,
        type: DataType.STRING(300)
    })
    address:string;

    @Column({
        type: DataType.STRING(256),
        allowNull: false,
        validate: {
            isEmail: true
        },
        unique:true
    })
    email:string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
        allowNull: false
    })
    is_email_confirmed:boolean;

    @Column({
        type: DataType.STRING(20),
        allowNull: false
    })
    phone:string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
        allowNull: false
    })
    is_phone_confirmed:boolean;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue:0
    })
    timezone_offset:number;

    @Column({
        type: DataType.CHAR(2),
        allowNull: true
    })
    country_code:string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    password_hash:string;

    @Column({
        type: DataType.CHAR(2),
        allowNull: false,
        defaultValue:'en'
    })
    language:string;
/*
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    stripe_id;*/

    @Column({
        type: DataType.BOOLEAN,
        allowNull: true
    })
    is_archived:boolean;

    @Column({
        type: 'UNIQUEIDENTIFIER',
        allowNull: true
    })
    create_user_id:string;

    @Column({
        type: DataType.STRING(50),
        allowNull: true
    })
    ref_code:string;

    
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue:false
    })
    is_uni_teeth_scheme:string;

    @HasMany(() => UserRole)
    user_roles: UserRole[];

    @HasMany(() => UserInvitation)
    user_invitations: UserInvitation[];

    @HasMany(() => UserProcedure)
    user_procedures: UserProcedure[];

    @HasOne(() => Organization)
    organization: Organization;

    @HasMany(() => Appointment)
    patient_appointments:Appointment[];

    @HasOne(() => Patient)
    user_patient:Patient;
}

export class UserWeb{

    id?:any;
    fullname?:any;
    birthday?:any;
    sex?:any;
    photo?:any;
    address?:any;
    email?:any;
    is_email_confirmed?:any;
    phone?:any;
    is_phone_confirmed?:any;
    timezone_offset?:any;
    country_code?:any;
    password_hash?:any;
    language?:any;
   // stripe_id?;
    is_archived?:any;
    create_user_id?:any;
    ref_code?:any;
    user_roles?:Array<UserRoleWeb>;

    password?:any;
    password_new?:any;


}
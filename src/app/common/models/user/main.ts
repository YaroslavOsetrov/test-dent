import {UserRoleModel} from './user_role';

export class UserModel{
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
    is_uni_teeth_scheme?:any;
   // stripe_id?;
    is_archived?:any;
    create_user_id?:any;
    ref_code?:any;
    user_roles?:Array<UserRoleModel>;

    password?:any;
    password_new?:any;

    role?:any;


}
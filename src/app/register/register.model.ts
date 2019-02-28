export class RegisterUser{
    email       :string;
    password    :string;
}

export class InitialUser{
    fullname    :string;
    phone       :string;
    
}

export class RegisterToken{
    token               :string;
    confirmation_code   :string;
}

export class RegisterUserResponse{
    token          :string;
    user_account   :Object;
}

export class RegisterConfirmResponse{
    organization:any;
    token:string;
    user:any;
}
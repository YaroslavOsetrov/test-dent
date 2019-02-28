import {Table, Column, Model, HasMany, DataType} from 'sequelize-typescript';

@Table({
    timestamps: false
})
export class AppCountry extends Model<AppCountry> {


    @Column({
        type: DataType.CHAR(2),
        primaryKey: true
    })
    country_code:string;

    @Column({
        type: DataType.CHAR(3),
        allowNull:false
    })
    currency_code:string;

    @Column({
        type: DataType.STRING(5),
        allowNull:false
        
    })
    currency_symbol:string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull:false,
        defaultValue:false
    })
    is_currency_preffix:boolean;
    
    @Column({
        type:DataType.INTEGER,
        allowNull:false,
        defaultValue:100
    })
    minimum_prefix:number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull:false,
        defaultValue:false
    })
    is_billing_available:boolean;

    @Column({
        type: DataType.INTEGER,
        allowNull:false
    })
    phone_code:number;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull:false,
        defaultValue:1
    })
    rate_usd:number;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull:false,
        defaultValue:1
    })
    monthly_fee:number;

    @Column({
        type: DataType.DECIMAL(18,2),
        allowNull:false,
        defaultValue:1
    })
    monthly_fee_base:number;

    @Column({
        type: DataType.INTEGER,
        allowNull:false,
        defaultValue:200
    })
    storage_size:number;

    @Column({
        type: DataType.INTEGER,
        allowNull:false,
        defaultValue:100
    })
    patients_limit:number;
}

export class ConfigModel{
    language         :string;
    currency_code    :string;
    organization_id  :number;
    country_code     :string;
    timezone_offset  :number;
    tax              :number;
    custom_fields?:any;
}

export class CurrencyModel{
    symbol:string;
    is_currency_prefix:boolean;
}

export class LocaleFormatModel{
    first_day_index:number;
    date_short:string;
    date_month:string;
    date_full:string;
    date_short2:string;
    date_full2:string;
    date_input:string;
    date_input_mask_mom:string;
    date_input_mask:string;
    date_input_mask_ph:string;
    is_24h:boolean;
    time_mom:string;
    cal_col:string;
}

export class CountryModel{
    currency_code       :string;
    currency_symbol     :string;
    is_currency_preffix :boolean;
    phone_code          :string;
    to_usd_rate         :string;
    locale_format       :LocaleFormatModel

}
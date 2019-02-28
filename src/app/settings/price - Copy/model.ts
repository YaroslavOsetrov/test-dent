
export class PriceProcedure{
    name    :string;
    code    :string;
    price   :Array<number>;
}
export class PriceList{
    fee_labels  :Array<string>;
    data        :Array<Array<PriceProcedure>>;
}

export class ProcedureСategory{

    icon_code       :string;
    translate_code  :string;

}

export class ProcedurePrice{

    icon_code   :string;
    name        :string;
    code        :string;

}
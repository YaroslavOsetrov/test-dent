export class SubscriptionModel{
    id?;
    organization_id?;
    expire_date?;
    balance?;
    monthly_fee?;
    monthly_fee_base?;
    currency_code?;
    available_sms?;
    is_card_error?;
    renew_attempts?;
    organization?;
    subscription_payments?;
}

export class CreditCardModel{
    number?;
    type?;
    cvv?;
    owner?;
    expire?;
}


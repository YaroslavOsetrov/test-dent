//libs
import {Router, Request, Response, RequestHandler} from 'express';
import * as moment from 'moment';

//services
import {ConfigService} from './../services/configService';
import {JWTService, JWTverify} from './../services/jwtService';

//models
import {Organization} from './../models/organization/main';
import {OrganizationSubscription} from './../models/organization/subscription';
import {User} from './../models/user/main';
import {UserRole} from './../models/user/user_role';

//externals
import {loginInviteRouter} from './loginInvite';

const router = Router();

router.post('/', (req:Request, res:Response) => {

    if (!req.body.email || !req.body.password){
        return res.status(400).json({message: 'ENTER_ACCOUNT_CREDENTIALS'});
    }

    User.findOne<User>({
        where:{
            email:req.body.email
        },
        include:[{
            model:UserRole
        }]
    }).then(
        user => {

            if (!user){
                return res.status(404).json({message: 'ACCOUNT_NOT_FOUND'});
            }

            let isCorrectPwd = user.check_password(req.body.password);

            if (!isCorrectPwd){
                return res.status(400).json({message: 'INCORRECT_PASSWORD'});
            }

            let organizationIds:Array<number> = [];
            user.getDataValue('user_roles').forEach((row:UserRole) => {
                organizationIds.push(row.getDataValue('organization_id'));
            });

            Organization.findAll({
                where:{
                    id:organizationIds
                },
                include:[User]
            }).then(
                organizations => {

                    let jwt = new JWTService({
                        account_id      : user.id,
                        created         : user.createdAt
                    }, 1);

                    res.json({
                        auth_token      : jwt.get_token(),
                        organizations   : organizations,
                        account_id      : user.id,
                        token_expire_at : moment().add(1, 'days'),
                    });
                }
            )
        }
    )
})

router.post('/confirm/:organization_id', (req:Request, res:Response) => {
    let token = JWTverify(req.body.auth_token);

    if (!token){
        return res.status(400).json({message:'INVALID_TOKEN'});
    }

    _performLogin(req, res, token.account_id, req.params.organization_id);
});

router.use('/invite', loginInviteRouter);

export const loginRouter =  router;

export const _performLogin = (req:Request, res:Response, userId:string, organizationId:number) => {

    UserRole.findOne({
        where:{
            organization_id:organizationId,
            user_id:userId
        }
    }).then(
        userRole => {
            if (!userRole){
                return res.status(400).json({message:'USER_NOT_BELONGS'});
            }

            Organization.findById(organizationId, {
                include:[OrganizationSubscription]
            }).then(
                organization => {

                    let subscription: OrganizationSubscription = organization.getDataValue('organization_subscription');

                    let days_to_expire:number = moment(subscription.expire_date).diff(moment(), 'days');

                    let token_days:number = 15;

                    if (days_to_expire < 15)
                        token_days = days_to_expire;
                    
                    if (subscription.is_card_error || days_to_expire <= 0)
                        token_days = 1;

                    let isAppInactive = ((subscription.is_card_error && subscription.renew_attempts >= 3) || days_to_expire == 0);
                    
                    User.findOne<User>({
                        where:{
                            id:userRole.getDataValue('user_id')
                        }
                    }).then(
                        user => {

                            let jwt = new JWTService({
                                account_id      : user.getDataValue('id'),
                                language        : user.getDataValue('language'),
                                country_code    : user.getDataValue('country_code'),
                                organization_id : organization.getDataValue('id'),
                                user_role       : userRole
                            }, token_days);

                            res.json({
                                user            : user,
                                organization    : organization,
                                is_app_inactive : isAppInactive,
                                token           : jwt.get_token(),
                                token_expire_at : moment().add(token_days, 'days'),
                            });
                        }
                    )

                }
            )
        }
    )

}
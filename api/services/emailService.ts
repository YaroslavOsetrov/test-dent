import * as fs from 'fs';

import * as emailLib from 'emailjs';

const env = process.env.APP_ENV || 'development';

import {ConfigService} from './configService';

class EmailModel{
    to:string;
    template:string;
    language:string;
    templatePath?:string;
    isLayout?:boolean;
}

export class EmailService{

    private server:any;

    private to:string;

    private from:string = 'noreply@dentaltap.com';

    private title:string;

    private template:string;
    private language:string;

    private templatePath:string;

    private html_content:any;

    private isLayout:boolean;

    private replacement_obj:any;

    configService:ConfigService;

    constructor(){

        this.replacement_obj = [];
        
        this.configService = new ConfigService();

        this.server = emailLib.server.connect(this.configService.getConfig('noreply_email'));

    }

    configure(email:EmailModel){
        this.to = email.to;
        this.template  = email.template;

        this.templatePath = email.templatePath;

        this.isLayout = email.isLayout;

        this.language = email.language;

    }

    replaceHtml(replace_object:any){

        this.replacement_obj = replace_object;

    }

    send(){
        
        if (!this.templatePath)
            this.templatePath = '';
        else
            this.templatePath = this.templatePath + '/';


        
        if (this.isLayout){
            return this.execLayout();
        }else{
            return this.execBase();
        }


    }

    private execLayout(){
        fs.readFile(require('app-root-dir').get() + '/public/i18n/email_templates/' + this.templatePath + '/layout.html', (err, html) => {

            if (err){
                throw 'EMAIL_LAYOUT_TEMPLATE_NOT_FOUND';
            }else{
                
                this.execBase(html.toString());
            }

        });
    }

    private execBase(layout?){

        if (layout){
            this.html_content = layout;
        }



        fs.readFile(require('app-root-dir').get() + '/public/i18n/email_templates/' + this.templatePath + '/' + this.template + '.html', (err, html) => {

            console.log(err);
            
            if (err){
                throw 'EMAIL_TEMPLATE_NOT_FOUND';
            }else{

                if (layout){
                    this.html_content = this.html_content.replace('%content.template%', html.toString());
                }else{
                    this.html_content = html.toString();
                }
                

                fs.readFile(require('app-root-dir').get() + '/public/i18n/email_templates/' +  this.language + '/' + this.template + '.json', 'utf8', (err, data) => {

                    if (err){
                        throw 'EMAIL_TEMPLATE_NOT_FOUND';
                    }

                    let contentReplacements:any = JSON.parse(data.toString());

                    fs.readFile(require('app-root-dir').get() + '/public/i18n/email_templates/' +  this.language + '/common.json', 'utf8', (err, data) => {

                        let commonReplacements:any = JSON.parse(data.toString());


                        console.log(commonReplacements);

                        for(let key in commonReplacements){

                            this.html_content = this.html_content.replace(new RegExp('%common.'+key+'%', 'g'), commonReplacements[key]);
                            this.html_content = this.html_content.replace(new RegExp('%common.company.'+key+'%', 'g'), commonReplacements[key]);
                            this.html_content = this.html_content.replace(new RegExp('%'+key+'%', 'g'), commonReplacements[key]);
                        }
                        
                        for(let key in contentReplacements){
                            this.html_content = this.html_content.replace(new RegExp('%'+key+'%', 'g'), contentReplacements[key]);
                            this.html_content = this.html_content.replace(new RegExp('%content.'+key+'%', 'g'), contentReplacements[key]);
                        }
                        

                        this.html_content = this.html_content.replace('%app.route%', this.configService.getConfig('app_route')[env]);

                        for (let key in this.replacement_obj){
                            this.html_content = this.html_content.replace('%'+key+'%', this.replacement_obj[key]);
                        }
                        
                        this.server.send({
                            from:    this.from,
                            to:      this.to,
                            subject: contentReplacements['subject'],
                            attachment: [
                                {data: this.html_content, alternative:true}
                            ]
                        }, (err, message) => {

                            if (err){

                                return err;
                            }
                        });
                    });
                });
            }
        });
    }

    create_text_email(to:string, header:string){

    }
    create_html_email(to:string, header:string, file_name:string){

    }



}
import * as fs from 'fs';

import * as aws from 'aws-sdk';

aws.config.update({
    accessKeyId:$AWS_ACCESS_KEY,
    secretAccessKey:$AWS_SECRET_ACCESS_KEY
});

export class AWSService{

    s3;

    constructor(bucket:string){
        this.s3 = new aws.S3({params:{Bucket:bucket}});
    }

    upload(filename:string, file:any, contentType:string, res:any, optData?:any){
        
        if (contentType == null){
            contentType = 'application/octet-stream';
        }


        try{
            this.s3.upload({
                Bucket:'dentaltap',
                Key:filename,
                Body:file,
                ContentType:contentType,
                ACL: 'public-read'
            }, (err, data) => {
                if (optData){
                    res.json(optData);
                }else
                    res.json({filename:filename});
            });
        }catch(e){
            if (optData){
                res.json(optData);
            }else
                if (filename)
                res.json({filename:filename});
        }
        
    }

}
import {config, database} from './../config';

export class ConfigService{


    getConfig(section:string){

        return config[section];

    }

    getDatabase(env:string){

        return database[env];

    }


}
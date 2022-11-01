import { TerraformGenerator } from 'terraform-generator';
import path from 'path';
import dotenv from 'dotenv';

const fs = require('fs');

dotenv.config();

export interface Variables {
    region: string;
    vpcCidr: string;
    project: string;
    publicCidr: string;
    privateCidr: string;
}

export function createInstance(variables: Variables) {
    const tfg = new TerraformGenerator();

    tfg.provider('aws', {
        region: variables.region,
        access_key: process.env.AWS_CLIENT_ID,
        secret_key: process.env.AWS_CLIENT_SECRET
    });

    tfg.resource('aws_instance', 'web', {
        ami: 'ami-0c55b159cbfafe1f0',
        instance_type: 't2.micro',
        vpc_security_group_ids: ['${aws_security_group.main.id}'],
        tags: {
            Name: `${variables.project}-web`
        }
    });

    const outputDir = path.join('output','modules/');
    tfg.write({ dir: outputDir, format: true });

    fs.rename(outputDir + 'terraform.tf', outputDir + 'instances.tf', function(err) {
        if ( err ) console.log('ERROR: ' + err);
    });
}
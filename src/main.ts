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

export function createModule(variables: Variables) {
    const tfg = new TerraformGenerator();

    tfg.provider('aws', {
        region: variables.region
    });

    tfg.module('test-module', {
        source: './module',
    });

    const res = tfg.output('test', {
        value: '${module.test-module.test}'
    });

    const outputDir = path.join('output');
    tfg.write({ dir: outputDir, format: true });

    fs.rename(outputDir + 'terraform.tf', outputDir + 'main.tf', function(err) {
        if ( err ) console.log('ERROR: ' + err);
    });

    return res;
}
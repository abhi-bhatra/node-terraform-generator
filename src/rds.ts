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

export function createRDS(variables: Variables) {
    const tfg = new TerraformGenerator();

    tfg.provider('aws', {
        region: variables.region,
        access_key: process.env.AWS_CLIENT_ID,
        secret_key: process.env.AWS_CLIENT_SECRET
    });

    const secgrp_rds = tfg.resource('aws_security_group', 'secgrp-rds', {
        name: `${variables.project}-rds-sg`,
        description: 'Allow inbound traffic from the internet',
        vpc_id: '${aws_vpc.vpc.id}',
        ingress: [
            {
                from_port: 3306,
                to_port: 3306,
                protocol: 'tcp',
                cidr_blocks: ['0.0.0.0/0']
            }
        ],
        egress: [
            {
                from_port: 0,
                to_port: 0,
                protocol: '-1',
                cidr_blocks: ['0.0.0.0/0']
            }
        ]
    });

    const rds_subnet = tfg.resource('aws_db_subnet_group', 'rds-subnet', {
        name: `${variables.project}-rds-subnet`,
        subnet_ids: ['${aws_subnet.public.id}', '${aws_subnet.private.id}']
    });

    const rds = tfg.resource('aws_db_instance', 'rds', {
        identifier: `${variables.project}-rds`,
        allocated_storage: 20,
        engine: 'mysql',
        engine_version: '5.7',
        instance_class: 'db.t2.micro',
        name: 'wordpress',
        username: 'wordpress',
        password: 'wordpress',
        port: 3306,
        db_subnet_group_name: rds_subnet.id,
        vpc_security_group_ids: [secgrp_rds.id],
        skip_final_snapshot: true
    });

    const outputDir = path.join('output','modules/');
    tfg.write({ dir: outputDir, format: true });

    fs.rename(outputDir + 'terraform.tf', outputDir + 'rds.tf', function(err) {
        if ( err ) console.log('ERROR: ' + err);
    });
}
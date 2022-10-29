import { TerraformGenerator, Resource, Map, map, fn } from 'terraform-generator';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export function createTfInstance() {
    const tfg = new TerraformGenerator();

    tfg.provider('aws', {
        region: 'ap-southeast-1',
        access_key: process.env.AWS_CLIENT_ID,
        secret_key: process.env.AWS_CLIENT_SECRET
    });

    const vpc = tfg.data('aws_vpc', 'vpc', {
        cidr_block: '172.16.0.0/16',
        enable_dns_hostnames: true,
    });

    const subnet = tfg.data('aws_subnet', 'subnet', {
        vpc_id: vpc.id,
        cidr_block: '172.16.1.0/24',
    });

    const securityGroup = tfg.data('aws_security_group', 'security_group', {
        vpc_id: vpc.id,
        name: 'allow_all',
        ingress: [{
            from_port: 0,
            to_port: 0,
            protocol: '-1',
            cidr_blocks: ['0.0.0.0/0'],
        }],
        egress: [{
            from_port: 0,
            to_port: 0,
            protocol: '-1',
            cidr_blocks: ['0.0.0.0/0'],
        }],
    });

    const instance = tfg.resource('aws_instance', 'instance', {
        ami: 'ami-0c55b159cbfafe1f0',
        instance_type: 't2.micro',
        subnet_id: subnet.id,
        vpc_security_group_ids: [securityGroup.id],
    });
    
    const result = tfg.generate();

    const outputDir = path.join('output');
    tfg.write({ dir: outputDir, format: true });

    return result.tf;
}

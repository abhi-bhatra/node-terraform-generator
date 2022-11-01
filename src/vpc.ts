import { TerraformGenerator } from "terraform-generator";
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

export function createVPC(variables: Variables) {
    const tfg = new TerraformGenerator();

    tfg.provider('aws', {
        region: `${variables.region}`,
        access_key: process.env.AWS_CLIENT_ID,
        secret_key: process.env.AWS_CLIENT_SECRET
    });

    const vpc = tfg.resource('aws_vpc', 'vpc', {
        cidr_block: `${variables.vpcCidr}`,
        enable_dns_hostnames: true,
        enable_dns_support: true,
        tags : {
            Name: `${variables.project}-vpc`
        }
    });

    const publicSubnet = tfg.resource('aws_subnet', 'public', {
        vpc_id: vpc.id,
        cidr_block: `${variables.publicCidr}`,
        tags: {
            Name: `${variables.project}-public-subnet`
        }
    });

    const privateSubnet = tfg.resource('aws_subnet', 'private', {
        vpc_id: vpc.id,
        cidr_block: `${variables.privateCidr}`,
        map_public_ip_on_launch: false,
        tags: {
            Name: `${variables.project}-private-subnet`
        }
    });

    const igw = tfg.resource('aws_internet_gateway', 'igw', {
        vpc_id: vpc.id,
        depends_on: [vpc],
        tags: {
            Name: `${variables.project}-igw`
        }
    });

    const routeTable = tfg.resource('aws_route_table', 'main', {
        vpc_id: vpc.id,
        route: {
            cidr_block: '0.0.0.0/0',
            gateway_id: igw.id
        },
        tags: {
            Name: `${variables.project}-route-table`
        }
    });

    const internetAccess = tfg.resource('aws_route_table_association', 'internet_access', {
        subnet_id: publicSubnet.id,
        route_table_id: routeTable.id
    });

    const elasticIp = tfg.resource('aws_eip', 'nat', {
        vpc: true,
        tags: {
            Name: `${variables.project}-nat-eip`
        }
    });

    const natGateway = tfg.resource('aws_nat_gateway', 'nat', {
        allocation_id: elasticIp.id,
        subnet_id: publicSubnet.id,
        depends_on: [publicSubnet, elasticIp],
        tags: {
            Name: `${variables.project}-nat-gateway`
        }
    });

    const route = tfg.resource('aws_route', 'private', {
        route_table_id: routeTable.id,
        destination_cidr_block: '0.0.0.0/0',
        nat_gateway_id: natGateway.id
    });

    const securityGroup = tfg.resource('aws_security_group', 'main', {
        name: `${variables.project}-security-group`,
        description: 'Allow SSH and HTTP traffic',
        vpc_id: vpc.id,
        ingress: {
            from_port: 22,
            to_port: 22,
            protocol: 'tcp',
            cidr_blocks: ['0.0.0.0/0']
        },
        egress: {
            from_port: 0,
            to_port: 0,
            protocol: '-1', 
            cidr_blocks: ['0.0.0.0/0']
        },
        tags: {
            Name: `${variables.project}-security-group`
        }
    });

    const outputDir = path.join('output','modules/');
    tfg.write({ dir: outputDir, format: true });

    // rename terraform.tf to vpc.tf
    fs.rename(outputDir + 'terraform.tf', outputDir + 'vpc.tf', function(err) {
        if ( err ) console.log('ERROR: ' + err);
    });
}

// import { TerraformGenerator, Resource, map, fn } from 'terraform-generator';
const { TerraformGenerator, Resource, map, fn } = require('terraform-generator');

const tfg = new TerraformGenerator({
    required_version: '>= 0.12'
});

tfg.provider('aws', {
    region: 'us-east-1',
    access_key: 'AKIAIOSFODNN7EXAMPLE',
    secret_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
});

const vpc = tfg.resource('aws_vpc', 'vpc', {
    cidr_block: '172.88.0.0/16'
});

const subnet = tfg.resource('aws_subnet', 'subnet', {
    cidr_block: '172.88.2.0/24',
    vpc_id: vpc.id
});


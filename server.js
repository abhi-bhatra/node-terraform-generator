// import { TerraformGenerator, Resource, map, fn } from 'terraform-generator';
var _a = require('terraform-generator'), TerraformGenerator = _a.TerraformGenerator, Resource = _a.Resource, map = _a.map, fn = _a.fn;
var tfg = new TerraformGenerator({
    required_version: '>= 0.12'
});
tfg.provider('aws', {
    region: 'us-east-1',
    access_key: 'AKIAIOSFODNN7EXAMPLE',
    secret_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
});
var vpc = tfg.resource('aws_vpc', 'vpc', {
    cidr_block: '172.88.0.0/16'
});
var subnet = tfg.resource('aws_subnet', 'subnet', {
    cidr_block: '172.88.2.0/24',
    vpc_id: vpc.id
});
//# sourceMappingURL=server.js.map
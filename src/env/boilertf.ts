import { TerraformGenerator, Resource, Map, map, fn } from 'terraform-generator';
import path from 'path';

export function createTerraformGenerator() {
    const project = 'example';

    const configs = {
        env: 'dev',
        tiers: [
            {
                name: 'web',
                cidr: '172.88.100.0/22',
                subnetCidrs: ['172.88.100.0/24', '172.88.101.0/24', '172.88.102.0/24']
            },
            {
                name: 'app',
                cidr: '172.88.104.0/22',
                subnetCidrs: ['172.88.104.0/24', '172.88.105.0/24', '172.88.106.0/24']
            },
            {
                name: 'db',
                cidr: '172.88.108.0/22',
                subnetCidrs: ['172.88.108.0/24', '172.88.109.0/24', '172.88.110.0/24']
            }
        ]
    };

    const getAvailabilityZone = (i: number): string => {
        if (i === 0) {
            return 'ap-southeast-1a';
        } else if (i === 1) {
            return 'ap-southeast-1b';
        } else {
            return 'ap-southeast-1c';
        }
    };

    const getTagName = (type: string, name?: string): string =>
        `${type}-${project}-${configs.env}${name ? `-${name}` : ''}`;

    const getTags = (type: string, name?: string): Map => new Map({
        Name: getTagName(type, name),
        Project: project,
        Env: configs.env
    });

    const tfg = new TerraformGenerator();

    tfg.provider('aws', {
        region: 'ap-southeast-1',
        access_key: 'AKIAIOSFODNN7EXAMPLE',
        secret_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    });

    const vpc = tfg.data('aws_vpc', 'vpc', {
        filter: [{
            name: 'tag:Name',
            values: [getTagName('vpc')]
        }]
    });

    const subnets = {
        web: [],
        app: [],
        db: []
    };

    configs.tiers.forEach(tier => {
        tier.subnetCidrs.forEach((cidr, i) => {
            const name = `${tier.name}${i}`;
            const subnet = tfg.resource('aws_subnet', `subnet_${name}`, {
                vpc_id: vpc.id,
                cidr_block: cidr,
                availability_zone: getAvailabilityZone(i),
                tags: getTags('subnet', name)
            });
            subnets[tier.name].push(subnet);
        });
    });

    tfg.output('subnets', {
        value: map({
            webSubnets: subnets.web.map(subnet => subnet.id),
            appSubnets: subnets.app.map(subnet => subnet.id),
            dbSubnets: subnets.db.map(subnet => subnet.id)
        })
    });

    const result = tfg.generate();

    const outputDir = path.join('output', configs.env, 'subnets');
    tfg.write({ dir: outputDir, format: true });

    return result.tf;
}

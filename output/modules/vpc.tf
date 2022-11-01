provider "aws" {
  region     = "us-east-1"
  access_key = "AKIAIOSFODNN7EXAMPLE"
  secret_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
}

resource "aws_vpc" "vpc" {
  cidr_block           = "172.16.0.0"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags {
    Name = "staging-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.vpc.id
  cidr_block = "172.16.1.0"
  tags {
    Name = "staging-public-subnet"
  }
}

resource "aws_subnet" "private" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = "172.16.2.0"
  map_public_ip_on_launch = false
  tags {
    Name = "staging-private-subnet"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id
  depends_on = [
    aws_vpc.vpc
  ]
  tags {
    Name = "staging-igw"
  }
}

resource "aws_route_table" "main" {
  vpc_id = aws_vpc.vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags {
    Name = "staging-route-table"
  }
}

resource "aws_route_table_association" "internet_access" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.main.id
}

resource "aws_eip" "nat" {
  vpc = true
  tags {
    Name = "staging-nat-eip"
  }
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public.id
  depends_on = [
    aws_subnet.public,
    aws_eip.nat
  ]
  tags {
    Name = "staging-nat-gateway"
  }
}

resource "aws_route" "private" {
  route_table_id         = aws_route_table.main.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat.id
}

resource "aws_security_group" "main" {
  name        = "staging-security-group"
  description = "Allow SSH and HTTP traffic"
  vpc_id      = aws_vpc.vpc.id
  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }
  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }
  tags {
    Name = "staging-security-group"
  }
}


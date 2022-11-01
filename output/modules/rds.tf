provider "aws" {
  region     = "us-east-1"
  access_key = "AKIAIOSFODNN7EXAMPLE"
  secret_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
}

resource "aws_security_group" "secgrp-rds" {
  name        = "staging-rds-sg"
  description = "Allow inbound traffic from the internet"
  vpc_id      = aws_vpc.vpc.id
  ingress {
    from_port = 3306
    to_port   = 3306
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
}

resource "aws_db_subnet_group" "rds-subnet" {
  name = "staging-rds-subnet"
  subnet_ids = [
    "${aws_subnet.public.id}",
    "${aws_subnet.private.id}"
  ]
}

resource "aws_db_instance" "rds" {
  identifier           = "staging-rds"
  allocated_storage    = 20
  engine               = "mysql"
  engine_version       = "5.7"
  instance_class       = "db.t2.micro"
  name                 = "wordpress"
  username             = "wordpress"
  password             = "wordpress"
  port                 = 3306
  db_subnet_group_name = aws_db_subnet_group.rds-subnet.id
  vpc_security_group_ids = [
    aws_security_group.secgrp-rds.id
  ]
  skip_final_snapshot = true
}


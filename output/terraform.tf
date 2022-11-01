provider "aws" {
  region = "us-east-1"
}

module "test-module" {
  source = "./module"
}

output "test" {
  value = module.test-module.test
}


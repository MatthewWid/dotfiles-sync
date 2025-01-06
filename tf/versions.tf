terraform {
	backend "s3" {
		bucket = "dotfiles-sync-tfstate"
		key = "terraform.tfstate"
		region = "ap-southeast-2"
	}

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

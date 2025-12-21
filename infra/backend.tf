terraform {
  backend "s3" {
    bucket         = "collabsphere-terraform-state"
    key            = "frontend/terraform.tfstate"
    region         = "ap-southeast-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

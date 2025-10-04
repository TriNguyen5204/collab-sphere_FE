# CollabSphere Frontend

React + Vite collaborative project management platform.

## Development

```bash
npm install
npm run dev
```

## Deployment

**Already have Jenkins?** → Read **[SETUP-FOR-EXISTING-JENKINS.md](SETUP-FOR-EXISTING-JENKINS.md)** (step-by-step guide)

Just push to GitHub - Jenkins will automatically:
1. Build the app
2. Create Docker image
3. Deploy to AWS

### First Time Setup

1. **Create AWS Infrastructure** (one-time):
```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars - add your Jenkins IP
terraform init
terraform apply
```

2. **Configure Jenkins** (one-time):
   - Add credential `dockerhub-credentials` (Username: nguyense21, Password: your token)
   - Add credential `app-server-ssh` (Username: ubuntu, Private Key: from `~/.ssh/collabsphere-key`)
   - Create pipeline job from this GitHub repo
   - Set `DEPLOY_HOST` parameter from: `terraform output jenkins_deploy_host`

3. **Done!** Every git push will auto-deploy.

## Tech Stack

- React 18 + Vite 7.1.5 (requires Node 20+)
- Docker + Nginx
- AWS (Terraform + Ansible)
- Jenkins CI/CD

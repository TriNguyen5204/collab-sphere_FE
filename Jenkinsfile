pipeline {
    agent any

    environment {
        DOCKER_IMAGE         = 'nguyense21/collab-sphere-fe'
        DOCKER_CREDENTIAL_ID = 'dockerhub-credentials'
        
        INFRA_DIR            = 'infra'
        TF_VARS_FILE         = 'terraform.tfvars'
        SSH_CREDENTIAL_ID    = 'collabsphere-ssh-key'
    }

    stages {
        stage('Infrastructure: Provision & Configure') {
            steps {
                script {
                    dir(env.INFRA_DIR) {
                        echo "=== Provisioning and Configuring Infrastructure ==="
                        sh 'terraform init'
                        sh "terraform apply -var-file=${env.TF_VARS_FILE} -auto-approve"
                        echo "Configuring the new server with Ansible..."
                        sshagent(credentials: [env.SSH_CREDENTIAL_ID]) {
                            sh """
                                ansible-playbook \
                                  -i inventory \
                                  playbook.yml
                            """
                        }
                        
                        echo "=== Infrastructure is Ready ==="
                    }
                }
            }
        }

        stage('Application: Build & Deploy') {
            parallel {
                stage('Build App') {
                    agent {
                        docker {
                            image 'node:20-alpine'
                            args '-v $HOME/.npm:/root/.npm'
                        }
                    }
                    steps {
                        echo "Installing dependencies and building application..."
                        sh 'npm ci'
                        sh 'npm run build'
                    }
                }

                stage('Build Docker Image') {
                    steps {
                        echo "Building Docker image..."
                        script {
                            def imageTag = "${env.DOCKER_IMAGE}:${env.BUILD_NUMBER}"
                            docker.build(imageTag, ".")
                            docker.withRegistry("https://index.docker.io/v1/", env.DOCKER_CREDENTIAL_ID) {
                                docker.image(imageTag).push()
                                docker.image(imageTag).push("latest")
                            }
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    def deployHost = sh(script: "cd ${env.INFRA_DIR} && terraform output -raw jenkins_deploy_host", returnStdout: true).trim()

                    if (!deployHost) {
                        error "Failed to get DEPLOY_HOST from Terraform output."
                    }

                    echo "Deploying to host: ${deployHost}"
                    
                    sshagent(credentials: [env.SSH_CREDENTIAL_ID]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${deployHost} '
                                docker pull ${env.DOCKER_IMAGE}:latest &&
                                docker stop collab-sphere-fe || true &&
                                docker rm collab-sphere-fe || true &&
                                docker run -d \\
                                  --name collab-sphere-fe \\
                                  -p 80:80 \\
                                  --restart unless-stopped \\
                                  ${env.DOCKER_IMAGE}:latest
                            '
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. Cleaning up workspace.'
            cleanWs()
            dir(env.INFRA_DIR) {
                // sh "terraform destroy -var-file=${env.TF_VARS_FILE} -auto-approve"
            }
        }
    }
}

pipeline {
    agent any
    environment {
        DOCKER_IMAGE_NAME = "nguyense21/collabsphere-frontend"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Deploy Green Environment with Terraform') {
            steps {
                script {
                    withCredentials([aws(credentialsId: 'aws-jenkins-credentials')]) {
                        echo 'Provisioning GREEN server...'
                        dir('infra') {
                            sh 'terraform init'
                            sh 'terraform plan'
                            sh 'terraform apply -auto-approve'
                    
                            env.APP_SERVER_IP = sh(script: 'terraform output -raw public_ip', returnStdout: true).trim()
                            echo "New GREEN Server IP: ${env.APP_SERVER_IP}"
                            
                            // Validate IP format
                            if (!env.APP_SERVER_IP || env.APP_SERVER_IP == "null") {
                                error "Failed to get valid IP address from Terraform output"
                            }
                            
                            // Wait for AWS to propagate the Elastic IP association
                            echo "Waiting for Elastic IP association to propagate..."
                            sleep(time: 30, unit: 'SECONDS')
                        }
                    }
                }
            }
        }

        stage('Configure Server with Ansible') {
            when {
                expression { env.WORKING_SSH_CREDENTIAL != null }
            }
            steps {
                script {
                    sh """
                        ssh-keygen -f '/var/lib/jenkins/.ssh/known_hosts' -R '${env.APP_SERVER_IP}' || echo 'No existing host key found'
                        echo "Host key removed for ${env.APP_SERVER_IP}"
                    """
                    
                    echo "Configuring server with Ansible..."
                    dir('infra') {
                        sh "echo '[all]\n${env.APP_SERVER_IP}' > inventory"

                        sshagent(credentials: ['collabsphere-ssh-key']) {
                            sh """
                                export ANSIBLE_HOST_KEY_CHECKING=False
                                ansible-playbook -i inventory playbook.yml --user ubuntu \\
                                    -e 'host_key_checking=False' \\
                                    --ssh-extra-args='-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null'
                            """
                        }
                    }
                }
            }
        }

        stage('Build and Push Docker Image') {
            steps {
                script {
                    echo "=== DISK SPACE CHECK & CLEANUP ==="
                    
                    // Move to root directory to avoid infra folder
                    dir('.') {
                        // Check available disk space
                        sh """
                            echo "Current working directory:"
                            pwd
                            ls -la
                            echo "Disk space before cleanup:"
                            df -h || echo "df command not available"
                        """
                        
                        // Cleanup Docker to free space
                        sh """
                            echo "Cleaning up Docker resources..."
                            docker system prune -f || echo "Docker cleanup failed"
                            docker image prune -f || echo "Docker image cleanup failed"
                            
                            # Remove old unused images
                            docker images --filter "dangling=true" -q | xargs -r docker rmi || echo "No dangling images"
                        """
                        
                        // Check space after cleanup
                        sh """
                            echo "Disk space after cleanup:"
                            df -h || echo "df command not available"
                        """
                        
                        echo "=== BUILDING DOCKER IMAGE ==="
                        echo "Build Docker image: ${env.DOCKER_IMAGE_NAME}"
                        
                        // Build with reduced context and explicit dockerignore
                        sh """
                            echo "Checking .dockerignore:"
                            cat .dockerignore || echo "No .dockerignore found"
                            
                            echo "Docker build context size estimation:"
                            find . -name "infra" -type d -exec du -sh {} \\; || echo "No infra folder"
                            
                            echo "Building Docker image (excluding infra folder)..."
                            docker build --no-cache -t ${env.DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER} .
                            docker tag ${env.DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER} ${env.DOCKER_IMAGE_NAME}:latest
                        """
                        
                        withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                            sh """
                                echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin
                                docker push ${env.DOCKER_IMAGE_NAME}:latest
                            """
                        }
                    }
                }
            }
        }

        stage('Deploy to App Server') {
            steps {
                sshagent(credentials: ['collabsphere-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${env.APP_SERVER_IP} '
                            docker pull ${env.DOCKER_IMAGE_NAME}:latest
                            docker stop collabsphere-app || true
                            docker rm collabsphere-app || true
                            docker run -d --name collabsphere-app -p 80:80 ${env.DOCKER_IMAGE_NAME}:latest
                            echo "Deployment successful!"
                        '
                    """
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "=== POST-BUILD CLEANUP ==="
                // Cleanup workspace but keep essential files
                sh """
                    echo "Cleaning up Terraform files to save space..."
                    rm -rf infra/.terraform/ || echo "No .terraform folder to clean"
                    rm -f infra/*.tfstate.backup || echo "No backup files to clean"
                    
                    echo "Cleaning up Docker build cache..."
                    docker builder prune -f || echo "Docker builder cleanup failed"
                    
                    echo "Final disk space check:"
                    df -h || echo "df command not available"
                """
            }
            cleanWs() 
        }
        failure {
            script {
                echo "=== BUILD FAILED - EMERGENCY CLEANUP ==="
                sh """
                    echo "Emergency cleanup due to build failure..."
                    docker system prune -af || echo "Emergency Docker cleanup failed"
                    rm -rf infra/.terraform/ || echo "No .terraform to clean"
                """
            }
        }
    }
}
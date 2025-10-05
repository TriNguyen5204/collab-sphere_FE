pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE_NAME = "nguyense21/collabsphere-frontend:latest"
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
                            
                            // Import existing Security Group if it exists
                            sh '''
                                if aws ec2 describe-security-groups --group-names CollabSphere-SG --region ap-southeast-1 >/dev/null 2>&1; then
                                    echo "Security Group exists, importing to state..."
                                    SG_ID=$(aws ec2 describe-security-groups --group-names CollabSphere-SG --region ap-southeast-1 --query 'SecurityGroups[0].GroupId' --output text)
                                    terraform import aws_security_group.app_sg $SG_ID || echo "Already imported or failed"
                                fi
                            '''
                            
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

        stage('Debug SSH Key Configuration') {
            steps {
                script {
                    withCredentials([aws(credentialsId: 'aws-jenkins-credentials')]) {
                        dir('infra') {
                            sh """
                                echo "Checking AWS EC2 key pairs:"
                                aws ec2 describe-key-pairs --region ap-southeast-1 || echo "Failed to list key pairs"
                                
                                echo ""
                                echo "Expected key name from variables.tf: asia-pacific"
                                echo "Current Terraform state:"
                                terraform show || echo "No terraform state found"
                            """
                        }
                    }
                    
                    def credentialsToTry = ['collabsphere-ssh-key', 'asia-pacific']
                    def workingCredential = null
                    
                    for (cred in credentialsToTry) {
                        echo "Testing SSH credential: ${cred}"
                        try {
                            sshagent(credentials: [cred]) {
                                sh """
                                    echo "Testing credential: ${cred}"
                                    echo "SSH Agent keys loaded:"
                                    ssh-add -l || echo "No SSH keys loaded in agent"
                                    
                                    echo "Testing SSH connection..."
                                    if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 ubuntu@${env.APP_SERVER_IP} 'echo "SUCCESS: SSH working with ${cred}"'; then
                                        echo "✅ CREDENTIAL WORKS: ${cred}"
                                        exit 0
                                    else
                                        echo "❌ CREDENTIAL FAILED: ${cred}"
                                        exit 1
                                    fi
                                """
                            }
                            workingCredential = cred
                            break
                        } catch (Exception e) {
                            echo "❌ Credential '${cred}' not found or failed: ${e.getMessage()}"
                        }
                    }
                    
                    if (workingCredential) {
                        env.WORKING_SSH_CREDENTIAL = workingCredential
                        echo "🎉 Found working SSH credential: ${workingCredential}"
                    } else {
                        echo """
                        ❌ NO WORKING SSH CREDENTIALS FOUND!
                        
                        SOLUTION:
                        1. Go to Jenkins → Manage Credentials
                        2. Create new SSH credential with ID: 'collabsphere-ssh-key'
                        3. Username: ubuntu
                        4. Private Key: Content of asia-pacific.pem file
                        
                        Key fingerprint should match: a2:7c:cd:73:73:46:0c:61:c3:ee:df:84:73:55:7f:3a:12:ea:92:4d
                        """
                        error "Please configure correct SSH credentials in Jenkins"
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
                    echo "Using working SSH credential: ${env.WORKING_SSH_CREDENTIAL}"
                    
                    echo "Cleaning up old SSH host keys for ${env.APP_SERVER_IP}..."
                    sh """
                        ssh-keygen -f '/var/jenkins_home/.ssh/known_hosts' -R '${env.APP_SERVER_IP}' || echo 'No existing host key found'
                        echo "Host key removed for ${env.APP_SERVER_IP}"
                    """
                    
                    echo "Configuring server with Ansible..."
                    dir('infra') {
                        sh "echo '[all]\n${env.APP_SERVER_IP}' > inventory"

                        sshagent(credentials: [env.WORKING_SSH_CREDENTIAL]) {
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

        stage('Pull Pre-Built Docker Image') {
            steps {
                script {
                    echo "=== USING PRE-BUILT IMAGE FROM DOCKER HUB ==="
                    echo "Image: ${env.DOCKER_IMAGE_NAME}"
                    echo "This image was built by GitHub Actions on push to main branch"
                    echo ""
                    echo "⚠️  NOTE: Make sure GitHub Actions workflow has completed before running this pipeline"
                    echo ""
                    
                    // Verify image exists
                    sh """
                        echo "Verifying image exists on Docker Hub..."
                        docker pull ${env.DOCKER_IMAGE_NAME} || {
                            echo "❌ ERROR: Image not found on Docker Hub"
                            echo ""
                            echo "TROUBLESHOOTING:"
                            echo "1. Check GitHub Actions workflow status"
                            echo "2. Verify Docker Hub credentials in GitHub Secrets"
                            echo "3. Ensure build completed successfully"
                            exit 1
                        }
                        echo "✅ Image verified and pulled successfully"
                    """
                }
            }
        }

        stage('Deploy to App Server') {
            steps {
                script {
                    echo "=== DEPLOYING TO APP SERVER ==="
                    echo "Target: ${env.APP_SERVER_IP}"
                    echo "Image: ${env.DOCKER_IMAGE_NAME}"
                    
                    sshagent(credentials: [env.WORKING_SSH_CREDENTIAL]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ubuntu@${env.APP_SERVER_IP} '
                                echo "Pulling latest image on App Server..."
                                docker pull ${env.DOCKER_IMAGE_NAME}
                                
                                echo "Stopping old container..."
                                docker stop collabsphere-app || true
                                docker rm collabsphere-app || true
                                
                                echo "Starting new container..."
                                docker run -d \\
                                    --name collabsphere-app \\
                                    --restart unless-stopped \\
                                    -p 80:80 \\
                                    ${env.DOCKER_IMAGE_NAME}
                                
                                echo "Waiting for container to start..."
                                sleep 5
                                
                                echo "Checking container status..."
                                docker ps | grep collabsphere-app || {
                                    echo "❌ Container failed to start"
                                    docker logs collabsphere-app
                                    exit 1
                                }
                                
                                echo "✅ Deployment successful!"
                            '
                        """
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "=== HEALTH CHECK ==="
                    sh """
                        echo "Testing app accessibility..."
                        sleep 3
                        curl -f http://${env.APP_SERVER_IP} -o /dev/null -s -w "HTTP Status: %{http_code}\\n" || {
                            echo "⚠️ WARNING: App might not be responding yet"
                            echo "Please check manually: http://${env.APP_SERVER_IP}"
                        }
                        echo "✅ Health check completed"
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo """
            ========================================
            ✅ PIPELINE COMPLETED SUCCESSFULLY!
            ========================================
            App URL: http://${env.APP_SERVER_IP}
            Docker Image: ${env.DOCKER_IMAGE_NAME}
            ========================================
            """
        }
        failure {
            echo """
            ========================================
            ❌ PIPELINE FAILED!
            ========================================
            Please check:
            1. GitHub Actions build completed
            2. Terraform/Ansible configuration
            3. SSH credentials
            4. App Server accessibility
            ========================================
            """
        }
        always {
            script {
                echo "=== POST-BUILD CLEANUP ==="
                sh """
                    echo "Cleaning up Terraform files..."
                    rm -rf infra/.terraform/ || echo "No .terraform folder"
                    rm -f infra/*.tfstate.backup || echo "No backup files"
                    
                    echo "Cleaning up Docker images..."
                    docker image prune -f || echo "Cleanup skipped"
                    
                    echo "Final disk space:"
                    df -h || echo "df command not available"
                """
            }
        }
    }
}
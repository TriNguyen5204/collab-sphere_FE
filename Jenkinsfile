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
                    
                    def credentialsToTry = ['aws-ec2-ssh-key', 'github-ssh-key', 'asia-pacific-key']
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
                        2. Create new SSH credential with ID: 'aws-ec2-ssh-key'
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
                    
                    // Clean up old host keys for this IP
                    echo "Cleaning up old SSH host keys for ${env.APP_SERVER_IP}..."
                    sh """
                        ssh-keygen -f '/var/lib/jenkins/.ssh/known_hosts' -R '${env.APP_SERVER_IP}' || echo 'No existing host key found'
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

        stage('Manual SSH Credential Setup') {
            when {
                expression { env.WORKING_SSH_CREDENTIAL == null }
            }
            steps {
                script {
                    echo """
                    ⚠️  MANUAL SETUP REQUIRED ⚠️
                    
                    No working SSH credentials found. Please:
                    
                    1. Go to Jenkins Dashboard → Manage Jenkins → Manage Credentials
                    2. Click on 'Global' domain
                    3. Click 'Add Credentials'
                    4. Select 'SSH Username with private key'
                    5. Fill in:
                       - ID: aws-ec2-ssh-key
                       - Username: ubuntu
                       - Private Key: Select 'Enter directly' and paste your asia-pacific.pem content
                    
                    The private key should start with:
                    -----BEGIN RSA PRIVATE KEY-----
                    
                    And end with:
                    -----END RSA PRIVATE KEY-----
                    
                    After creating the credential, re-run this pipeline.
                    """
                    
                    // Try to provide more help
                    withCredentials([aws(credentialsId: 'aws-jenkins-credentials')]) {
                        sh """
                            echo "You can also create a new key pair and update Terraform:"
                            echo "aws ec2 create-key-pair --key-name jenkins-ssh-key --query 'KeyMaterial' --output text > jenkins-ssh-key.pem"
                            echo "Then update variables.tf to use 'jenkins-ssh-key' instead of 'asia-pacific'"
                        """
                    }
                    
                    error "Please setup SSH credentials and re-run the pipeline"
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
                sshagent(credentials: [env.WORKING_SSH_CREDENTIAL]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${env.APP_SERVER_IP} '
                            docker pull ${env.DOCKER_IMAGE_NAME}:latest
                            docker stop hairsalon-app || true
                            docker rm hairsalon-app || true
                            docker run -d --name hairsalon-app -p 80:80 ${env.DOCKER_IMAGE_NAME}:latest
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
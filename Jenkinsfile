pipeline {pipeline {

    agent any    agent any

    environment {

    options {        DOCKER_IMAGE_NAME = "nguyense21/collabsphere-frontend"

        ansiColor('xterm')    }

        skipDefaultCheckout(true)

        timestamps()    stages {

    }        stage('Checkout Code') {

            steps {

    environment {                checkout scm

        DOCKER_IMAGE        = 'nguyense21/collab-sphere-fe'            }

        DOCKER_CREDENTIAL_ID = 'dockerhub-credentials'        }

        SSH_CREDENTIAL_ID    = 'app-server-ssh'

    }        stage('Deploy Green Environment with Terraform') {

            steps {

    parameters {                script {

        string(name: 'DEPLOY_HOST', defaultValue: '', description: 'Target host for deployment (e.g. ubuntu@1.2.3.4). Leave blank to skip deployment.')                    withCredentials([aws(credentialsId: 'aws-jenkins-credentials')]) {

        booleanParam(name: 'SKIP_DEPLOY', defaultValue: false, description: 'Skip the deployment stage when true.')                        echo 'Provisioning GREEN server...'

    }                        dir('infra') {

                            sh 'terraform init'

    stages {                            sh 'terraform plan'

        stage('Checkout') {                            sh 'terraform apply -auto-approve'

            steps {                    

                checkout scm                            env.APP_SERVER_IP = sh(script: 'terraform output -raw public_ip', returnStdout: true).trim()

            }                            echo "New GREEN Server IP: ${env.APP_SERVER_IP}"

        }                            

                            // Validate IP format

        stage('Install dependencies') {                            if (!env.APP_SERVER_IP || env.APP_SERVER_IP == "null") {

            steps {                                error "Failed to get valid IP address from Terraform output"

                sh 'npm ci --no-audit --prefer-offline'                            }

            }                            

        }                            // Wait for AWS to propagate the Elastic IP association

                            echo "Waiting for Elastic IP association to propagate..."

        stage('Lint') {                            sleep(time: 30, unit: 'SECONDS')

            steps {                        }

                sh 'npm run lint'                    }

            }                }

        }            }

        }

        stage('Build') {

            steps {        stage('Configure Server with Ansible') {

                sh 'npm run build'            when {

            }                expression { env.WORKING_SSH_CREDENTIAL != null }

        }            }

            steps {

        stage('Docker Build & Push') {                script {

            steps {                    sh """

                script {                        ssh-keygen -f '/var/lib/jenkins/.ssh/known_hosts' -R '${env.APP_SERVER_IP}' || echo 'No existing host key found'

                    def imageTag = "${env.DOCKER_IMAGE}:${env.BUILD_NUMBER}"                        echo "Host key removed for ${env.APP_SERVER_IP}"

                    sh """                    """

                        docker build \                    

                          --pull \                    echo "Configuring server with Ansible..."

                          -t ${imageTag} \                    dir('infra') {

                          -t ${env.DOCKER_IMAGE}:latest \                        sh "echo '[all]\n${env.APP_SERVER_IP}' > inventory"

                          .

                    """                        sshagent(credentials: ['collabsphere-ssh-key']) {

                            sh """

                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIAL_ID, usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {                                export ANSIBLE_HOST_KEY_CHECKING=False

                        sh """                                ansible-playbook -i inventory playbook.yml --user ubuntu \\

                            echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin                                    -e 'host_key_checking=False' \\

                            docker push ${imageTag}                                    --ssh-extra-args='-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null'

                            docker push ${env.DOCKER_IMAGE}:latest                            """

                            docker logout                        }

                        """                    }

                    }                }

                }            }

            }        }

        }

        stage('Build and Push Docker Image') {

        stage('Deploy') {            steps {

            when {                script {

                allOf {                    echo "=== DISK SPACE CHECK & CLEANUP ==="

                    expression { return !params.SKIP_DEPLOY }                    

                    expression { return params.DEPLOY_HOST?.trim() }                    // Move to root directory to avoid infra folder

                }                    dir('.') {

            }                        // Check available disk space

            steps {                        sh """

                sshagent(credentials: [env.SSH_CREDENTIAL_ID]) {                            echo "Current working directory:"

                    sh """                            pwd

                        ssh -o StrictHostKeyChecking=no ${params.DEPLOY_HOST} '                            ls -la

                            docker pull ${env.DOCKER_IMAGE}:latest &&                            echo "Disk space before cleanup:"

                            docker stop collab-sphere-fe || true &&                            df -h || echo "df command not available"

                            docker rm collab-sphere-fe || true &&                        """

                            docker run -d --name collab-sphere-fe -p 80:80 ${env.DOCKER_IMAGE}:latest                        

                        '                        // Cleanup Docker to free space

                    """                        sh """

                }                            echo "Cleaning up Docker resources..."

            }                            docker system prune -f || echo "Docker cleanup failed"

        }                            docker image prune -f || echo "Docker image cleanup failed"

    }                            

                            # Remove old unused images

    post {                            docker images --filter "dangling=true" -q | xargs -r docker rmi || echo "No dangling images"

        success {                        """

            echo 'Pipeline completed successfully.'                        

        }                        // Check space after cleanup

        failure {                        sh """

            echo 'Pipeline failed. Please review the stage logs for details.'                            echo "Disk space after cleanup:"

        }                            df -h || echo "df command not available"

        always {                        """

            cleanWs()                        

        }                        echo "=== BUILDING DOCKER IMAGE ==="

    }                        echo "Build Docker image: ${env.DOCKER_IMAGE_NAME}"

}                        

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
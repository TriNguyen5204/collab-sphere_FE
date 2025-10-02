pipeline {
    agent any

    options {
        ansiColor('xterm')
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
        DOCKER_IMAGE        = 'torithblackcat/collab-sphere-fe'
        DOCKER_CREDENTIAL_ID = 'dockerhub-credentials'
        SSH_CREDENTIAL_ID    = 'app-server-ssh'
    }

    parameters {
        string(name: 'DEPLOY_HOST', defaultValue: '', description: 'Target host for deployment (e.g. ubuntu@1.2.3.4). Leave blank to skip deployment.')
        booleanParam(name: 'SKIP_DEPLOY', defaultValue: false, description: 'Skip the deployment stage when true.')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci --no-audit --prefer-offline'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    def imageTag = "${env.DOCKER_IMAGE}:${env.BUILD_NUMBER}"
                    sh """
                        docker build \
                          --pull \
                          -t ${imageTag} \
                          -t ${env.DOCKER_IMAGE}:latest \
                          .
                    """

                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIAL_ID, usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh """
                            echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin
                            docker push ${imageTag}
                            docker push ${env.DOCKER_IMAGE}:latest
                            docker logout
                        """
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                allOf {
                    expression { return !params.SKIP_DEPLOY }
                    expression { return params.DEPLOY_HOST?.trim() }
                }
            }
            steps {
                sshagent(credentials: [env.SSH_CREDENTIAL_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${params.DEPLOY_HOST} '
                            docker pull ${env.DOCKER_IMAGE}:latest &&
                            docker stop collab-sphere-fe || true &&
                            docker rm collab-sphere-fe || true &&
                            docker run -d --name collab-sphere-fe -p 80:80 ${env.DOCKER_IMAGE}:latest
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Please review the stage logs for details.'
        }
        always {
            cleanWs()
        }
    }
}
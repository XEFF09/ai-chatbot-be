pipeline {
    agent any

    environment {
        APP_NAME = "ai-chatbot-gateway"
        REGISTRY = "xeff09"
        IMAGE_NAME = "${REGISTRY}/${APP_NAME}"
    }

    stages {
        stage('Initialize') {
            steps {
                checkout scm
                script {
                    env.SHORT_SHA = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                }
            }
        }

        // Triggered when a PR is OPEN targeting 'dev'
        stage('PR Build (feature → dev)') {
            when {
                allOf {
                    changeRequest() 
                    expression { env.CHANGE_TARGET == 'dev' }
                }
            }
            steps {
                echo "PR Target is: ${env.CHANGE_TARGET}"
                sh "docker build -f ./docker/dev.Dockerfile -t ${IMAGE_NAME}:pr-${SHORT_SHA} ."
            }
        }

        // Triggered when a PR is OPEN targeting 'main'
        stage('Prod Release Prep (dev → main)') {
            when {
                changeRequest target: 'main'
            }
            steps {
                echo "Preparing production image for PR ${env.CHANGE_ID}"
                
                // Build Prod Image
                sh """
                    docker build -f ./docker/prod.Dockerfile \
                        -t ${IMAGE_NAME}:${SHORT_SHA} \
                        -t ${IMAGE_NAME}:latest .
                """
                
                // Login and Push
                withCredentials([usernamePassword(
                    credentialsId: '9dee4997-e1bf-41e0-8c12-58fdfe122c33',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh 'echo "$PASS" | docker login -u "$USER" --password-stdin'
                    sh """
                        docker push ${IMAGE_NAME}:${SHORT_SHA}
                        docker push ${IMAGE_NAME}:latest
                    """
                }
            }
        }
    }

    post {
        always {
            // Clean up Docker credentials on the agent
            sh 'docker logout || true'
        }
        success { echo "✅ Pipeline completed successfully for ${env.BRANCH_NAME}" }
        failure { echo "❌ Pipeline failed" }
    }
}

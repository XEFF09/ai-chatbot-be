pipeline {
    agent any

    environment {
        APP_NAME = "ai-chatbot-gateway"
        REGISTRY = "xeff09"
        IMAGE_NAME = "${REGISTRY}/${APP_NAME}"
    }

    stages {
        stage('Checkout & Meta') {
            steps {
                checkout scm
                script {
                    env.SHORT_SHA = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                }
            }
        }

        // PATH 1: Open PR targeting 'dev'
        stage('Feature -> Dev Validation') {
            when {
                allOf {
                    changeRequest()
                    expression { env.CHANGE_TARGET == 'dev' }
                }
            }
            steps {
                echo "Validating PR targeting dev..."
                sh "docker build -f ./docker/dev.Dockerfile -t ${IMAGE_NAME}:pr-${SHORT_SHA} ."
                // No Push: Just checking if it builds/tests correctly
            }
        }

        // PATH 2: Open PR targeting 'main' (usually from 'dev')
        stage('Dev -> Main Release Prep') {
            when {
                allOf {
                    changeRequest()
                    expression { env.CHANGE_TARGET == 'main' }
                }
            }
            steps {
                echo "Preparing Release: building and pushing prod image..."
                sh """
                    docker build -f ./docker/prod.Dockerfile \
                        -t ${IMAGE_NAME}:${SHORT_SHA} \
                        -t ${IMAGE_NAME}:latest .
                """
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
            sh 'docker logout' // Good practice to clean up credentials
        }
    }
}

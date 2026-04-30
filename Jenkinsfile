pipeline {
    agent any 
    environment {
        APP_NAME = "ai-chatbot-gateway"
        REGISTRY_ORG = "xeff09"
        IMAGE_NAME = "${REGISTRY_ORG}/${APP_NAME}"
    }

    stages {

        stage('Initialize') {
          when {
              changeRequest()
            }
            steps {
                checkout scm
                script {
                    env.SHORT_SHA = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                }
            }
        }

        stage('Dev Build') {
            when {
                allOf {
                  changeRequest target: 'develop'
                  expression { env.CHANGE_BRANCH ==~ /^feature\/.*/ }
                }
            }
            steps {
                echo "Building DEV image for PR #${env.CHANGE_ID}: ${env.CHANGE_BRANCH} -> ${env.CHANGE_TARGET}"
                sh "docker build -t ${IMAGE_NAME}:dev -f ./docker/dev.Dockerfile ."
            }
            post {
                always {
                    sh "docker rmi ${IMAGE_NAME}:dev || true"
                }
            }
        }

        stage('Prod Build') {
            when {
                allOf {
                    changeRequest target: 'main' 
                    expression { env.CHANGE_BRANCH == 'develop' }
                }
            }
            steps {
                echo "Building PROD image for PR #${env.CHANGE_ID}: ${env.CHANGE_BRANCH} -> ${env.CHANGE_TARGET}"
                sh "docker build -t ${IMAGE_NAME}:latest -f ./docker/prod.Dockerfile ."
                sh "docker build -t ${IMAGE_NAME}:${SHORT_SHA} -f ./docker/prod.Dockerfile ."
            }
        }

        stage('Login & Push to Registry') {
          when {
              allOf {
                  changeRequest target: 'main' 
                  expression { env.CHANGE_BRANCH == 'develop' }
              }
          }
          steps {
              echo "Logging in to Docker registry and pushing images for PR #${env.CHANGE_ID}"
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
            sh 'docker logout || true'
        }
        success { echo "✅ Pipeline completed successfully" }
        failure { echo "❌ Pipeline failed" }
    }
}

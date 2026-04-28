pipeline {
  agent any

  environment {
    APP_NAME   = "ai-chatbot-gateway"
    REGISTRY   = "xeff09"
    IMAGE_NAME = "${REGISTRY}/${APP_NAME}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Set Version') {
      steps {
        script {
          env.SHORT_SHA = sh(
            script: "git rev-parse --short HEAD",
            returnStdout: true
          ).trim()
        }
      }
    }

    stage('PR Build & Test (feature -> dev)') {
      when {
        changeRequest target: 'dev'
      }
      steps {
        sh """
          echo "PR: feature -> dev"
          docker build -f ./docker/dev.Dockerfile \
            -t ${IMAGE_NAME}:pr-${SHORT_SHA} .
        """
      }
    }

    stage('Prod Build (dev -> main PR)') {
      when {
        changeRequest target: 'main'
      }
      steps {
        sh """
          echo "PR: dev -> main (prod build preview)"
          docker build -f ./docker/prod.Dockerfile \
            -t ${IMAGE_NAME}:${SHORT_SHA} \
            -t ${IMAGE_NAME}:latest .
        """
      }
    }

    stage('Login Docker Hub (after merge to main)') {
      when {
        branch 'main'
      }
      steps {
        withCredentials([usernamePassword(
          credentialsId: '9dee4997-e1bf-41e0-8c12-58fdfe122c33',
          usernameVariable: 'USER',
          passwordVariable: 'PASS'
        )]) {
          sh 'echo "$PASS" | docker login -u "$USER" --password-stdin'
        }
      }
    }

    stage('Prod Build & Push (after merge to main)') {
      when {
        branch 'main'
      }
      steps {
        sh """
          docker build -f ./docker/prod.Dockerfile \
            -t ${IMAGE_NAME}:${SHORT_SHA} \
            -t ${IMAGE_NAME}:latest .
          docker push ${IMAGE_NAME}:${SHORT_SHA}
          docker push ${IMAGE_NAME}:latest
        """
      }
    }

  }

  post {
    success { echo "Pipeline success" }
    failure { echo "Pipeline failed" }
  }
}

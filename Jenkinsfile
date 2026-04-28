pipeline {
  agent any

  environment {
    APP_NAME = "ai-chatbot-gateway"
    REGISTRY = "xeff09"
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

    stage('Debug PR Info') {
      steps {
        sh """
          echo "CHANGE_ID=${env.CHANGE_ID}"
          echo "CHANGE_BRANCH=${env.CHANGE_BRANCH}"
          echo "CHANGE_TARGET=${env.CHANGE_TARGET}"
          echo "BRANCH_NAME=${env.BRANCH_NAME}"
        """
      }
    }

    stage('PR Build & Test (dev)') {
      when {
        allOf {
          changeRequest()
          expression { env.CHANGE_TARGET == 'dev' }
        }
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
        allOf {
          changeRequest()
          expression { env.CHANGE_TARGET == 'main' }
        }
      }
      steps {
        sh """
          echo "PR: dev -> main (prod build)"
          docker build -f ./docker/prod.Dockerfile \
            -t ${IMAGE_NAME}:${SHORT_SHA} \
            -t ${IMAGE_NAME}:latest .
        """
      }
    }

    stage('Login Docker Hub (dev -> main PR)') {
      when {
        allOf {
          changeRequest()
          expression { env.CHANGE_TARGET == 'main' }
        }
      }
      steps {
        withCredentials([usernamePassword(
          credentialsId: '9dee4997-e1bf-41e0-8c12-58fdfe122c33',
          usernameVariable: 'USER',
          passwordVariable: 'PASS'
        )]) {
          sh '''
            echo "$PASS" | docker login -u "$USER" --password-stdin
          '''
        }
      }
    }

    stage('Push (dev -> main PR)') {
      when {
        allOf {
          changeRequest()
          expression { env.CHANGE_TARGET == 'main' }
        }
      }
      steps {
        sh """
          docker push ${IMAGE_NAME}:${SHORT_SHA}
          docker push ${IMAGE_NAME}:latest
        """
      }
    }
  }

  post {
    success {
      echo "✅ Pipeline success"
    }
    failure {
      echo "❌ Pipeline failed"
    }
  }
}

pipeline {
  agent any
  environment {
    APP_NAME  = "ai-chatbot-gateway"
    REGISTRY  = "xeff09"
    IMAGE_NAME = "${REGISTRY}/${APP_NAME}"
  }
  stages {

    // Runs on every PR and every branch push
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    // Runs on every PR and every branch push
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

    // PR: feature → dev
    stage('PR Build & Test (feature → dev)') {
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

    // PR: dev → main
    stage('Prod Build (dev → main PR)') {
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

    // After merge → main (push to main triggers this)
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
          sh '''echo "$PASS" | docker login -u "$USER" --password-stdin'''
        }
      }
    }

    // After merge → main: build final image and push
    stage('Prod Build & Push (after merge to main)') {
      when {
        branch 'main'
      }
      steps {
        sh """
          docker build -f ./docker/prod.Dockerfile \
            -t ${IMAGE_NAME}:${SHORT_SHA} \
            -t ${IMAGE_NAME}:latest .
          docker push ${IMAGE_NA

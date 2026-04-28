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
          env.SHORT_SHA = env.GIT_COMMIT.take(7)
        }
      }
    }
    
    stage('PR Build & Test') {
      when {
        changeRequest()
      }
      steps {
        sh """
          echo "Running PR validation..."
          docker build -f ./docker/dev.Dockerfile -t ${IMAGE_NAME}:pr-${SHORT_SHA} .
        """
      }
    }

    stage('Prod Build') {
      when {
        allOf {
          branch 'main'
          not { changeRequest() }
        }
      }
      steps {
        sh """
          docker build -f ./docker/prod.Dockerfile \
            -t ${IMAGE_NAME}:${SHORT_SHA} \
            -t ${IMAGE_NAME}:latest .
        """
      }
    }

    stage('Login Docker Hub') {
      when {
        branch 'main'
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

    stage('Push') {
      when {
        branch 'main'
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
      echo "✅ Build passed"
    }
    failure {
      echo "❌ Build failed"
    }
  }
}

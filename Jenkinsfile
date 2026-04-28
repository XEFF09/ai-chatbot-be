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
    
    stage('Debug Workspace') {
      steps {
        sh 'ls -la'
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

    stage('Deploy') {
      when { branch 'main' }
      steps {
        sh '''
          set -e

          echo "Pulling latest image..."
          docker-compose -f docker-compose.prod.yml pull

          echo "Starting containers..."
          docker-compose -f docker-compose.prod.yml up -d

          echo "Done."
        '''
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

def isMergeFromDevelop() {
  def changeLogSets = currentBuild.changeSets

  if (!changeLogSets) return false

  for (changeSet in changeLogSets) {
    for (entry in changeSet.items) {
      def msg = entry.msg?.toLowerCase()

      if (msg?.contains("merge") && msg?.contains("develop")) {
        return true
      }
    }
  }

  return false
}

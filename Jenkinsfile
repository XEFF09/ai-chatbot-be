pipeline {
  agent any

  environment {
    APP_NAME = "ai-chatbot-gateway"
    REGISTRY_ORG = "xeff09"
    IMAGE_NAME = "${REGISTRY_ORG}/${APP_NAME}"
    LATEST_TAG = "latest"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        script {
          env.SHORT_SHA = env.GIT_COMMIT.take(7)

          sh """
            docker build -f prod.Dockerfile \
              -t ${IMAGE_NAME}:${SHORT_SHA} \
              -t ${IMAGE_NAME}:${LATEST_TAG} .
          """
        }
      }
    }

    stage('Push to registry') {
      when {
        allOf {
          branch 'main'
          expression { return isMergeFromDevelop() }
        }
      }
      steps {
        sh """
          docker push ${IMAGE_NAME}:${LATEST_TAG}
        """
      }
    }

    stage('Deploy') {
      when {
        allOf {
          branch 'main'
          expression { return isMergeFromDevelop() }
        }
      }
      steps {
        sh """
          docker compose -f docker-compose.prod.yml up -d
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

def isMergeFromDevelop() {
  def changeLogSets = currentBuild.changeSets

  if (changeLogSets == null || changeLogSets.isEmpty()) {
    return false
  }

  for (changeSet in changeLogSets) {
    for (entry in changeSet.items) {
      def msg = entry.msg?.toLowerCase()

      if (msg != null && msg.contains("merge") && msg.contains("develop")) {
        return true
      }
    }
  }

  return false
}

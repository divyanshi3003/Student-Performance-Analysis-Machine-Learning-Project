pipeline {
    agent any

    environment {
        PYTHON_VERSION = '3.11'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Backend') {
            steps {
                dir('backend') {
                    sh 'python3 -m venv venv'
                    sh '. venv/bin/activate && pip install --upgrade pip'
                    sh '. venv/bin/activate && pip install -r requirements.txt'
                    sh '. venv/bin/activate && pip install pytest httpx'
                }
            }
        }
        
        stage('Test Backend') {
            steps {
                dir('backend') {
                    sh '. venv/bin/activate && pytest tests/ -v --junitxml=test-results.xml'
                }
            }
            post {
                always {
                    junit 'backend/test-results.xml'
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline passed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
    }
}

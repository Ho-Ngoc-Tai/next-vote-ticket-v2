pipeline {
    agent any

    parameters {
        choice(
            name: 'ENV',
            choices: ['test', 'production'],
            description: 'Chọn môi trường để build và deploy'
        )
    }

    stages {

        // ===== INIT ENV =====
        stage('Init Env') {
            steps {
                script {
                    // IMAGE LOCAL (image sau khi docker-compose build)
                    env.LOCAL_IMAGE = "vote-ticket-support-${params.ENV}"
                    env.LOCAL_DOCKER_COMPOSE_RUN = "docker/docker-compose.yml"

                    // IMAGE DOCKERHUB
                    env.IMAGE_NAME_DOCKERHUB = "tuanhd90/vote-ticket-support-${params.ENV}"

                    env.CONTAINER_NAME        = "vote-ticket-support-${params.ENV}"
                    env.COMPOSE_FILE_LOCAL   = "docker/docker-compose.${params.ENV}.yml"
                    env.ENV_FILE_LOCAL       = ".env.${params.ENV}"

                    // ===== DEFAULT: TEST =====
                    env.REMOTE_HOST        = "203.171.31.218"
                    env.REMOTE_PORT        = "23465"
                    env.REMOTE_USER        = "root"
                    env.SSH_CREDENTIAL     = "NEW_VPS_SSH_KEY"
                    env.DOCKER_CREDENTIAL  = "DOCKERHUB_CREDENTIAL"
                    env.REMOTE_DIR         = "docker/vote-ticket-support-${params.ENV}"
                    env.ENV_FILE_REMOTE    = "${env.REMOTE_DIR}/.env"
                    env.COMPOSE_FILE_REMOTE = "${env.REMOTE_DIR}/docker-compose.yml"

                    // ===== PRODUCTION OVERRIDE =====
                    if (params.ENV == 'production') {
                        env.REMOTE_HOST        = "203.171.31.251"
                        env.REMOTE_PORT        = "22"
                        env.REMOTE_USER        = "root"
                        env.SSH_CREDENTIAL     = "LIVE_SSH_KEY"
                        env.DOCKER_CREDENTIAL  = "LIVE_DOCKHUB_TEKTAK25"
                        env.IMAGE_NAME_DOCKERHUB = "tektak2025/vote-ticket-support-${params.ENV}"
                        env.REMOTE_DIR         = "docker/web-vote-ticket-support-${params.ENV}"
                        env.ENV_FILE_REMOTE    = "${env.REMOTE_DIR}/.env"
                        env.COMPOSE_FILE_REMOTE = "${env.REMOTE_DIR}/docker-compose.yml"
                    }

                    echo "➡️ ENV=${params.ENV}"
                    echo "📦 Local image: ${env.LOCAL_IMAGE}"
                    echo "🐳 DockerHub image: ${env.IMAGE_NAME_DOCKERHUB}"
                    echo "🖥 VPS: ${env.REMOTE_HOST}:${env.REMOTE_PORT}"
                }
            }
        }

        // ===== BUILD IMAGE (GIỮ NGUYÊN LOGIC BUILD BẰNG DOCKER-COMPOSE) =====
        stage('Build Docker Image') {
            steps {
                sh '''
                    set -e
                    echo "📦 Building image with docker-compose..."
                    docker-compose -f $COMPOSE_FILE_LOCAL build --no-cache
                '''
            }
        }

        // ===== TAG & PUSH TRỰC TIẾP LÊN DOCKERHUB =====
        stage('Tag & Push DockerHub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${env.DOCKER_CREDENTIAL}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        set -e
                        echo "🔖 Tag image to DockerHub..."
                        docker tag $LOCAL_IMAGE:latest $IMAGE_NAME_DOCKERHUB:latest

                        echo "🔑 Login DockerHub..."
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                        echo "🚀 Push image to DockerHub..."
                        docker push $IMAGE_NAME_DOCKERHUB:latest
                    '''
                }
            }
        }

        // ===== COPY ENV TO VPS (CHỈ TEST) =====
        stage('Copy env to VPS') {
            when {
                expression { params.ENV == 'test' }
            }
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: "${env.SSH_CREDENTIAL}", keyFileVariable: 'SSH_KEY')
                ]) {
                    sh '''
                        echo "📂 Ensure remote dir exists..."
                        ssh -i $SSH_KEY -p $REMOTE_PORT -o StrictHostKeyChecking=no \
                          $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR"

                        echo "📤 Copy env file to VPS..."
                        scp -i $SSH_KEY -P $REMOTE_PORT -o StrictHostKeyChecking=no \
                          $ENV_FILE_LOCAL $REMOTE_USER@$REMOTE_HOST:$ENV_FILE_REMOTE

                        scp -i $SSH_KEY -P $REMOTE_PORT -o StrictHostKeyChecking=no \
                          $LOCAL_DOCKER_COMPOSE_RUN $REMOTE_USER@$REMOTE_HOST:$COMPOSE_FILE_REMOTE
                    '''
                }
            }
        }

        // ===== DEPLOY TO VPS =====
        stage('Deploy to VPS') {
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: "${env.SSH_CREDENTIAL}", keyFileVariable: 'SSH_KEY'),
                    usernamePassword(
                        credentialsId: "${env.DOCKER_CREDENTIAL}",
                        usernameVariable: 'DOCKERHUB_USER',
                        passwordVariable: 'DOCKERHUB_PASS'
                    )
                ]) {
                    sh '''
                        echo "🚀 Deploying to VPS..."

                        ssh -i $SSH_KEY -p $REMOTE_PORT -o StrictHostKeyChecking=no \
                        $REMOTE_USER@$REMOTE_HOST <<EOF
                          set -e
                          cd $REMOTE_DIR

                          echo "🔑 Login DockerHub..."
                          echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin

                          
                          echo "📥 Pull latest images..."
                          docker compose pull || true

                          echo "🚀 Restart containers..."
                          docker compose up -d --remove-orphans

                          echo "🧼 Clean unused images..."
                          docker image prune -f
EOF
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment thành công cho môi trường ${params.ENV}"
        }
        failure {
            script {
                echo "❌ Deployment thất bại cho môi trường ${params.ENV}"
                withCredentials([
                    sshUserPrivateKey(credentialsId: env.SSH_CREDENTIAL, keyFileVariable: 'SSH_KEY')
                ]) {
                    sh '''
                        echo "📋 Fetch last 100 logs..."
                        ssh -i $SSH_KEY -p $REMOTE_PORT -o StrictHostKeyChecking=no \
                          $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_DIR && docker compose logs --tail=100 || true"
                    '''
                }
            }
        }
        always {
            echo "🏁 Pipeline đã chạy xong."
        }
    }
}

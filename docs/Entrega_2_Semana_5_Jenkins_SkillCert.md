# Entrega 2 Semana 5: Implementacion de Jenkins en SkillCert

John Edisson Vanegas Cuervo  
Politecnico Grancolombiano  
Enfasis Profesional I - Integracion Continua  
Fecha: 6 de junio de 2026

## Resumen

Esta entrega implementa Jenkins como gestor de operaciones de integracion continua para SkillCert. El pipeline valida el repositorio con checkout desde GitHub, instalacion de dependencias, pruebas backend, build frontend, validacion de Docker Compose y construccion de contenedores.

## Repositorio

URL: https://github.com/Jonevan369/skillcert-integracion-continua

## Evidencia real de Jenkins

La ejecucion `skillcert-ci #1` termino en `SUCCESS` con duracion aproximada de 1 minuto. La consola de Jenkins evidencia `npm test -w server`, `pass 3`, `docker ps`, `docker compose config`, `docker compose build` y la construccion de las imagenes `skillcert_ci_1-server` y `skillcert_ci_1-client`.

## Solucion del problema Docker

El error inicial de Docker se resolvio ejecutando el agente Jenkins con acceso al daemon Docker. En esta evidencia se uso Jenkins en contenedor con el socket montado y usuario root:

```bash
docker run -u root -v /Users/johnvanegas/.docker/run/docker.sock:/var/run/docker.sock skillcert-jenkins:local
```

En un agente Linux tradicional, el comando equivalente recomendado es:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

La evidencia `docker ps` en consola Jenkins confirma que el agente ya puede comunicarse con Docker.

## Webhook GitHub

La URL que debe configurarse en GitHub es:

```text
http://SERVIDOR_JENKINS/github-webhook/
```

Desde este entorno no se pudo capturar la pantalla real de webhooks porque GitHub solicito sesion/permisos de administrador al abrir `/settings/hooks`. Por esa razon no se incluye una captura falsa; se deja indicada la configuracion requerida para completarla desde la cuenta propietaria del repositorio.

## Anexo 1: Jenkinsfile completo

```groovy
pipeline {
  agent any

  tools {
    nodejs 'NodeJS-20'
  }

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  environment {
    NODE_ENV = 'test'
    COMPOSE_PROJECT_NAME = "skillcert_ci_${env.BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main',
          url: 'https://github.com/Jonevan369/skillcert-integracion-continua'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'node --version && npm --version'
        sh 'npm ci'
      }
    }

    stage('Backend Tests') {
      steps {
        sh 'npm test -w server'
      }
    }

    stage('Frontend Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Validate Docker Compose') {
      steps {
        sh 'docker ps'
        sh 'docker compose config'
      }
    }

    stage('Build containers') {
      steps {
        sh 'docker compose build'
      }
    }
  }

  post {
    always {
      sh 'docker compose down --volumes --remove-orphans || true'
    }
    success {
      echo 'SkillCert CI pipeline completed successfully.'
    }
    failure {
      echo 'SkillCert CI pipeline failed. Review the failing stage logs in Jenkins.'
    }
  }
}

```

# Insurance Recommendation System

A full-stack insurance recommendation application built with Next.js frontend and Node.js/Express backend with PostgreSQL database.

## Architecture

- **Frontend**: Next.js 15 with TypeScript, TailwindCSS, and TanStack Query
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker and Docker Compose

## Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- Git

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sg-insurance
```

### 2. Backend Setup

```bash
cd api

# Install dependencies
npm install

# Create environment file
cp .env-sample .env

# Edit .env with your local settings (defaults should work for Docker setup)
```

### 3. Start Backend Services

```bash
# Start PostgreSQL database and API server
docker compose up -d

# Check services are running
docker compose ps

# View logs if needed
docker compose logs -f
```

The backend will be available at `http://localhost:3000`

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3001`

### 5. Database Initialization

The database is automatically initialized with sample insurance products when the containers start. The `init.sql` file creates the products table and populates it with sample data.

## API Endpoints

- `POST /api/v1/recommendation` - Get insurance recommendation

### Request Body Example

```json
{
  "age": 30,
  "income": 75000,
  "number_of_dependents": 2,
  "risk_tolerance": "medium"
}
```

## Development Commands

### Backend

```bash
cd api

# Run tests
npm test

# Run in development mode (without Docker)
npm run dev

# Build for production
npm run build

# Start production build
npm start
```

### Frontend

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Stopping Services

```bash
cd api
docker compose down
```

## AWS Deployment

### Prerequisites

- AWS CLI configured with appropriate permissions
- Docker installed locally
- AWS account with access to ECS, RDS, VPC, and ECR

### 1. Database Setup (RDS PostgreSQL)

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier insurance-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-YOUR_SECURITY_GROUP \
  --db-subnet-group-name your-db-subnet-group \
  --backup-retention-period 7 \
  --storage-encrypted

# Get RDS endpoint
aws rds describe-db-instances \
  --db-instance-identifier insurance-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

### 2. Backend Deployment (ECS with Fargate)

#### Create ECR Repository

```bash
# Create ECR repository
aws ecr create-repository --repository-name insurance-api

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

#### Build and Push Docker Image

```bash
cd api

# Build image
docker build -t insurance-api .

# Tag for ECR
docker tag insurance-api:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/insurance-api:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/insurance-api:latest
```

#### Create ECS Task Definition

```json
{
  "family": "insurance-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "insurance-api",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/insurance-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DB_HOST",
          "value": "YOUR_RDS_ENDPOINT"
        },
        {
          "name": "DB_PORT",
          "value": "5432"
        },
        {
          "name": "DB_NAME",
          "value": "insurance_db"
        },
        {
          "name": "DB_USER",
          "value": "postgres"
        },
        {
          "name": "DB_PASSWORD",
          "value": "YOUR_SECURE_PASSWORD"
        },
        {
          "name": "FRONTEND_URL",
          "value": "https://your-frontend-domain.com"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/insurance-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Create ECS Service

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create ECS cluster
aws ecs create-cluster --cluster-name insurance-cluster

# Create service
aws ecs create-service \
  --cluster insurance-cluster \
  --service-name insurance-api-service \
  --task-definition insurance-api:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-abcdef],assignPublicIp=ENABLED}"
```

### 3. Frontend Deployment (Vercel - Recommended)

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

#### Alternative: Frontend on AWS (S3 + CloudFront)

```bash
cd frontend

# Build the application
npm run build

# Create S3 bucket
aws s3 mb s3://insurance-frontend-bucket

# Configure bucket for static website hosting
aws s3 website s3://insurance-frontend-bucket \
  --index-document index.html \
  --error-document error.html

# Upload build files
aws s3 sync out/ s3://insurance-frontend-bucket --delete

# Create CloudFront distribution (optional, for CDN)
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### 4. Load Balancer Setup

```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name insurance-alb \
  --subnets subnet-12345 subnet-67890 \
  --security-groups sg-abcdef

# Create target group
aws elbv2 create-target-group \
  --name insurance-api-targets \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-12345 \
  --health-check-path /health

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn YOUR_ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=YOUR_TARGET_GROUP_ARN
```

### 5. Database Migration

```bash
# Connect to RDS and run initialization script
psql -h YOUR_RDS_ENDPOINT -U postgres -d postgres -f api/init.sql
```

### 6. Domain and SSL Setup

```bash
# Create Route 53 hosted zone (if using Route 53)
aws route53 create-hosted-zone --name yourdomain.com --caller-reference $(date +%s)

# Request SSL certificate
aws acm request-certificate \
  --domain-name yourdomain.com \
  --domain-name *.yourdomain.com \
  --validation-method DNS
```

## Environment Variables

### Backend (.env)

```bash
NODE_ENV=production
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_NAME=insurance_db
DB_USER=postgres
DB_PASSWORD=your-secure-password
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend

```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

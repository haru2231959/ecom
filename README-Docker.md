# 🐳 Docker Setup for Express E-commerce API

Hướng dẫn chi tiết để chạy Express E-commerce API bằng Docker và Docker Compose.

## 📋 Yêu cầu hệ thống

- **Docker**: v20.10+ 
- **Docker Compose**: v2.0+
- **RAM**: Tối thiểu 4GB (khuyến nghị 8GB)
- **Disk Space**: Tối thiểu 5GB trống

## 🚀 Quick Start

### 1. Khởi tạo dự án
```bash
# Clone repository (nếu chưa có)
git clone <repository-url>
cd express-ecom

# Khởi tạo Docker environment
chmod +x docker-scripts.sh
./docker-scripts.sh init
```

### 2. Cấu hình environment
```bash
# Copy và chỉnh sửa file environment
cp .env.docker .env

# Cập nhật các thông tin cần thiết trong .env
nano .env
```

### 3. Khởi chạy development environment
```bash
# Start all services
./docker-scripts.sh dev

# Hoặc sử dụng docker-compose trực tiếp
docker-compose up -d --build
```

### 4. Truy cập ứng dụng
- **API**: http://localhost:3000
- **API Health**: http://localhost:3000/health
- **API Documentation**: http://localhost:3000/api-docs
- **phpMyAdmin**: http://localhost:8080
- **Redis Commander**: http://localhost:8081

## 🎯 Quick Reference

### Essential Commands
```bash
# Start development
./docker-scripts.sh dev

# View logs
./docker-scripts.sh logs

# Access shell
./docker-scripts.sh shell

# Stop everything
./docker-scripts.sh stop

# Clean up
./docker-scripts.sh clean

# Help
./docker-scripts.sh help
```

### Service URLs
- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Docs**: http://localhost:3000/api-docs
- **phpMyAdmin**: http://localhost:8080
- **Redis Commander**: http://localhost:8081

### Default Credentials
- **MySQL Root**: password
- **MySQL User**: ecom_user / password
- **phpMyAdmin**: root / password
- **Redis**: no password (development)

---

**⚡ Happy Dockerizing!** 🐳

Nếu bạn gặp vấn đề gì, hãy check troubleshooting section hoặc tạo issue trong repository.

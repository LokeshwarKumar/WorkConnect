# WorkConnect – Full Stack Service Marketplace Platform

## Overview

WorkConnect is a full-stack service marketplace platform that connects customers with skilled workers and service providers. The platform enables users to search for workers, book services, communicate in real time, leave reviews, and manage service requests.

Workers can showcase their skills, manage bookings, and build their reputation through ratings and reviews. Administrators can monitor platform activity, manage users, and oversee service requests.

## Features

### Authentication & Security

- JWT Authentication
- Google OAuth2 Login
- Email OTP Verification
- Role-Based Access Control (RBAC)
- BCrypt Password Encryption
- Protected REST APIs
- Secure WebSocket Communication
- HTTPS Enabled using SSL Certificates

### User Features

- User Registration with Email Verification
- Login using Email & Password
- Google OAuth2 Login
- Profile Management
- Search Workers by Skill
- View Worker Profiles
- Book Services
- Track Service Requests
- Real-Time Chat with Workers
- Submit Reviews and Ratings
- View Booking History

### Worker Features

- Worker Registration
- Worker Profile Management
- Skill Management
- Service Pricing
- Availability Management
- Accept or Reject Service Requests
- Chat with Customers
- Manage Bookings
- View Ratings and Reviews

### Admin Features

- Dashboard Analytics
- User Management
- Worker Management
- Service Request Monitoring
- Review Moderation
- Platform Monitoring

### Real-Time Features

- WebSocket Integration
- STOMP Messaging Protocol
- Instant Messaging
- User-to-User Communication

---

## System Architecture

```text
+---------------------+
|    React Frontend   |
+----------+----------+
           |
         HTTPS
           |
+----------v----------+
|       Nginx         |
|   Reverse Proxy     |
+----------+----------+
           |
+----------v----------+
|   Spring Boot API   |
+----------+----------+
           |
+----------v----------+
|       MySQL         |
+---------------------+
```

---

## Technology Stack

### Frontend

- React.js
- React Router
- Axios
- Bootstrap
- STOMP.js
- SockJS

### Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT
- OAuth2 Client
- Spring Mail
- WebSocket
- STOMP
- Maven

### Database

- MySQL

### Deployment

- AWS EC2
- Nginx
- Let's Encrypt SSL
- DuckDNS
- Vercel
- Render

---

## Project Structure

```text
WorkConnect
│
├── backend
│   ├── config
│   ├── controller
│   ├── dto
│   ├── entity
│   ├── repository
│   ├── service
│   ├── security
│   ├── websocket
│   ├── exception
│   └── util
│
├── frontend
│   ├── components
│   ├── pages
│   ├── services
│   ├── context
│   ├── hooks
│   └── utils
│
└── README.md
```

---

## Database Design

### Users

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50),
    provider VARCHAR(50),
    enabled BOOLEAN,
    created_at TIMESTAMP
);
```

### Workers

```sql
CREATE TABLE workers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    skill VARCHAR(255),
    experience INT,
    hourly_rate DOUBLE,
    description TEXT,
    availability BOOLEAN,
    rating DOUBLE
);
```

### Service Requests

```sql
CREATE TABLE service_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT,
    worker_id BIGINT,
    service_type VARCHAR(255),
    description TEXT,
    status VARCHAR(50),
    booking_date TIMESTAMP,
    created_at TIMESTAMP
);
```

### Reviews

```sql
CREATE TABLE reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT,
    worker_id BIGINT,
    rating INT,
    comment TEXT,
    created_at TIMESTAMP
);
```

### Chat Messages

```sql
CREATE TABLE chat_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sender_id BIGINT,
    receiver_id BIGINT,
    message TEXT,
    timestamp TIMESTAMP
);
```

### OTP Verification

```sql
CREATE TABLE verification_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255),
    otp VARCHAR(10),
    expiry_time TIMESTAMP,
    verified BOOLEAN,
    created_at TIMESTAMP
);
```

---

## Authentication Flow

### Registration Flow

```text
User Registration
        |
Generate OTP
        |
Send OTP via Email
        |
Verify OTP
        |
Activate Account
        |
Login Enabled
```

### JWT Authentication Flow

```text
User Login
     |
Authentication Manager
     |
Generate JWT
     |
Return Token
     |
Protected API Access
```

### OAuth2 Login Flow

```text
User
 |
Google Login
 |
OAuth2 Provider
 |
Spring Security
 |
Generate JWT
 |
Frontend
```

---

## WebSocket Chat Flow

```text
Client A
   |
WebSocket Endpoint
   |
STOMP Broker
   |
Client B
```

### Endpoint

```http
/ws
```

### Message Mapping

```http
/chat/send
```

### Subscription

```http
/user/queue/messages
```

---

## API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/verify-otp
POST /api/auth/resend-otp
POST /api/auth/login
GET  /oauth2/authorization/google
```

### Users

```http
GET /api/users/profile
PUT /api/users/profile
```

### Workers

```http
GET    /api/workers
GET    /api/workers/{id}
POST   /api/workers
PUT    /api/workers/{id}
DELETE /api/workers/{id}
```

### Service Requests

```http
POST   /api/requests
GET    /api/requests
GET    /api/requests/{id}
PUT    /api/requests/{id}
DELETE /api/requests/{id}
```

### Reviews

```http
POST /api/reviews
GET  /api/reviews/{workerId}
```

### Admin

```http
GET    /api/admin/dashboard
GET    /api/admin/users
GET    /api/admin/workers
DELETE /api/admin/users/{id}
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/<your-username>/workconnect.git
cd workconnect
```

### Backend Setup

Configure database and mail properties:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/workconnect
spring.datasource.username=root
spring.datasource.password=password

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

Build and run:

```bash
mvn clean install
mvn spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend URL:

```text
http://localhost:3000
```

---

## Deployment

### AWS EC2

Install Java:

```bash
sudo apt update
sudo apt install openjdk-21-jdk -y
```

Run application:

```bash
java -jar workconnect.jar
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name workcnct.duckdns.org;

    location / {
        proxy_pass http://localhost:8080;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Restart Nginx:

```bash
sudo systemctl restart nginx
```

### SSL Configuration

Install Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Generate SSL certificate:

```bash
sudo certbot --nginx -d workcnct.duckdns.org
```

Certificate Location:

```text
/etc/letsencrypt/live/workcnct.duckdns.org/fullchain.pem
/etc/letsencrypt/live/workcnct.duckdns.org/privkey.pem
```

---

## Future Enhancements

- Payment Gateway Integration
- AI-Based Worker Recommendations
- Location-Based Worker Search
- Push Notifications
- Email Notifications
- Mobile Application
- Service Scheduling Calendar
- Worker Verification System
- Video Consultation
- Analytics Dashboard

---

## Security Highlights

- JWT Authentication
- Google OAuth2 Login
- Email OTP Verification
- BCrypt Password Encryption
- Role-Based Authorization
- HTTPS with SSL Certificates
- Protected REST APIs
- Secure WebSocket Messaging

---

## Author

**Lokeshwar Kumar Thota**

B.Tech CSE (AI & ML)

Full Stack Java Developer | Spring Boot Developer | DevOps Enthusiast

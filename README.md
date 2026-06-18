WorkConnect – Full Stack Service Marketplace Platform
Overview

WorkConnect is a full-stack service marketplace platform that connects customers with skilled workers and service providers. The platform enables users to search for workers, book services, communicate in real time, leave reviews, and manage service requests. Workers can showcase their skills, manage bookings, and build their reputation through ratings and reviews.

The project is built using Spring Boot, React, MySQL, JWT Authentication, OAuth2 Login, Email OTP Verification, WebSocket STOMP, and AWS Cloud deployment.

Key Features
Authentication & Security
JWT Authentication
Google OAuth2 Login
Email OTP Verification
Role-Based Access Control (RBAC)
BCrypt Password Encryption
Protected REST APIs
Secure WebSocket Communication
HTTPS Enabled with SSL Certificate
User Features
User Registration with Email Verification
Login using Email and Password
Login using Google OAuth2
Manage User Profile
Search Workers by Skill
View Worker Profiles
Book Services
Track Service Requests
Real-Time Chat with Workers
Submit Reviews and Ratings
View Booking History
Worker Features
Worker Registration
Profile Management
Skill Management
Service Pricing
Availability Management
Accept or Reject Requests
Chat with Customers
Manage Bookings
View Ratings and Reviews
Admin Features
Dashboard Analytics
User Management
Worker Management
Service Request Monitoring
Review Moderation
Platform Control and Monitoring
Real-Time Features
WebSocket Integration
STOMP Messaging Protocol
Instant Messaging
User-to-User Communication
System Architecture
+---------------------+
|    React Frontend   |
+----------+----------+
           |
           |
        HTTPS
           |
+----------v----------+
|       Nginx         |
|   Reverse Proxy     |
+----------+----------+
           |
           |
+----------v----------+
|   Spring Boot API   |
+----------+----------+
           |
           |
+----------v----------+
|       MySQL         |
+---------------------+
Technology Stack
Frontend
React.js
React Router
Axios
Bootstrap
STOMP.js
SockJS
Backend
Java 21
Spring Boot
Spring Security
Spring Data JPA
JWT
OAuth2 Client
Spring Mail
WebSocket
STOMP
Maven
Database
MySQL
Cloud & Deployment
AWS EC2
Nginx
Let's Encrypt SSL
DuckDNS
Vercel
Render
Project Structure
WorkConnect
│
├── backend
│   ├── src/main/java
│   │
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
│   └── src/main/resources
│       ├── application.properties
│       └── application-prod.properties
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── context
│   │   ├── services
│   │   ├── hooks
│   │   └── utils
│
└── README.md
Database Design
Users Table
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
Workers Table
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
Service Requests Table
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
Reviews Table
CREATE TABLE reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT,
    worker_id BIGINT,
    rating INT,
    comment TEXT,
    created_at TIMESTAMP
);
Chat Messages Table
CREATE TABLE chat_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sender_id BIGINT,
    receiver_id BIGINT,
    message TEXT,
    timestamp TIMESTAMP
);
OTP Verification Table
CREATE TABLE verification_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255),
    otp VARCHAR(10),
    expiry_time TIMESTAMP,
    verified BOOLEAN,
    created_at TIMESTAMP
);
Authentication Flow
Registration Flow
User Registration
        |
        v
Generate OTP
        |
        v
Send OTP via Email
        |
        v
Verify OTP
        |
        v
Activate Account
        |
        v
Login Enabled
JWT Authentication Flow
User Login
     |
     v
Authentication Manager
     |
     v
Generate JWT
     |
     v
Return Token
     |
     v
Protected API Access
OAuth2 Login Flow
User
 |
 v
Google Login
 |
 v
OAuth2 Provider
 |
 v
Spring Security
 |
 v
Generate JWT
 |
 v
Frontend
WebSocket Chat Flow
Client A
   |
   v
WebSocket Endpoint
   |
   v
STOMP Broker
   |
   v
Client B
Endpoint
/ws
Message Mapping
/chat/send
Subscription
/user/queue/messages
API Endpoints
Authentication APIs
Register User
POST /api/auth/register
Verify OTP
POST /api/auth/verify-otp
Resend OTP
POST /api/auth/resend-otp
Login
POST /api/auth/login
OAuth2 Login
GET /oauth2/authorization/google
User APIs
GET    /api/users/profile
PUT    /api/users/profile
Worker APIs
GET    /api/workers
GET    /api/workers/{id}
POST   /api/workers
PUT    /api/workers/{id}
DELETE /api/workers/{id}
Service Request APIs
POST   /api/requests
GET    /api/requests
GET    /api/requests/{id}
PUT    /api/requests/{id}
DELETE /api/requests/{id}
Review APIs
POST   /api/reviews
GET    /api/reviews/{workerId}
Admin APIs
GET    /api/admin/dashboard
GET    /api/admin/users
GET    /api/admin/workers
DELETE /api/admin/users/{id}
Installation Guide
Clone Repository
git clone https://github.com/yourusername/workconnect.git
cd workconnect
Backend Setup

Configure database and mail properties:

spring.datasource.url=jdbc:mysql://localhost:3306/workconnect
spring.datasource.username=root
spring.datasource.password=password

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

Build and run:

mvn clean install
mvn spring-boot:run

Backend URL:

http://localhost:8080
Frontend Setup
cd frontend
npm install
npm start

Frontend URL:

http://localhost:3000
Production Deployment
AWS EC2
Install Java
sudo apt update
sudo apt install openjdk-21-jdk -y
Run Application
java -jar workconnect.jar
Nginx Reverse Proxy
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

Restart Nginx:

sudo systemctl restart nginx
SSL Configuration

Install Certbot:

sudo apt install certbot python3-certbot-nginx -y

Generate SSL Certificate:

sudo certbot --nginx -d workcnct.duckdns.org

Certificate Location:

/etc/letsencrypt/live/workcnct.duckdns.org/fullchain.pem
/etc/letsencrypt/live/workcnct.duckdns.org/privkey.pem
Future Enhancements
Payment Gateway Integration
AI-Based Worker Recommendation System
Location-Based Worker Search
Push Notifications
Email Notifications
Mobile Application
Service Scheduling Calendar
Worker Verification System
Video Consultation Support
Analytics and Reporting
Security Highlights
JWT Authentication
Google OAuth2 Login
Email OTP Verification
BCrypt Password Encryption
Role-Based Authorization
HTTPS with SSL Certificate
Secure REST APIs
Protected WebSocket Messaging

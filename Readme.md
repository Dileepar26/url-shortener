# URL Shortener

A URL Shortener application built using Node.js, Express.js, and MySQL, containerized with Docker. This application allows users to shorten long URLs, track analytics, and manage links with authentication and rate limiting.

The URL Shortener is hosted on Render at [https://url-shortener-3n6e.onrender.com](https://url-shortener-3n6e.onrender.com).

---

## **Features**

- **Shorten URLs**: Create short and easy-to-share versions of long URLs.
- **Analytics**: Track total clicks, unique clicks, and detailed user information such as operating systems, devices, and geolocation.
- **Rate Limiting**: Prevent abuse by limiting requests per IP address.
- **Authentication**: Secure access using Google Sign-In.
- **Dockerized**: Simplified deployment using Docker containers.

---

## **Technologies Used**

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: Google OAuth 2.0
- **Rate Limiting and Caching**: Redis
- **Containerization**: Docker
- **Environment Management**: dotenv
- **Logging**: Winston with daily rotating logs
- **Testing**: Mocha, Chai, and Postman

---

## **Prerequisites**

- Node.js (v18 or later)
- MySQL
- Docker and Docker Compose

---

## **Installation**

### **1. Clone the Repository**
```bash
git clone https://github.com/Dileepar26/url-shortener.git
cd url-shortener
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Configure Environment Variables**
Create a `.env` file in the root directory with the following variables:
```env
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASS=your-database-password
DB_NAME=your-database-name
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
REDIS_URL=redis://<database_name>:<password>@<public_endpoint>
```

### **4. Set Up the Database**
Run the following SQL commands to create the necessary tables:

**Users Table:**
```sql
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `googleId` varchar(255) NOT NULL,
  `displayName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `googleId` (`googleId`),
  UNIQUE KEY `email` (`email`)
);
```

**URLs Table:**
```sql
CREATE TABLE `urls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `longUrl` text NOT NULL,
  `shortUrl` varchar(255) NOT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shortUrl` (`shortUrl`)
);
```

**URL Analytics Table:**
```sql
CREATE TABLE `url_analytics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shortUrl` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `userAgent` text,
  `ipAddress` varchar(45) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `osType` varchar(255) DEFAULT NULL,
  `deviceType` varchar(255) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);
```

### **5. Start the Application**
```bash
npm start
```

### **6. (Optional) Run with Docker**
```bash
docker-compose up --build
```

---

## **Endpoints**

Detailed documentation of API endpoints is available here: [Postman Documentation](https://documenter.getpostman.com/view/25258547/2sAYJ3F2Dk).

### **Authentication**
- **Google Login**: `GET /auth/google`
- **Google Callback**: `GET /auth/google/callback`

### **URL and Analytics**
- **Shorten URL**: `POST /api/shorten`
- **Redirect to Long URL**: `GET /api/shorten/:alias`
- **Get URL Analytics**: `GET /api/analytics/:alias`
- **Get Topic-Based Analytics**: `GET /api/analytics/topic/:topic`
- **Get Overall Analytics**: `GET /api/analytics/overall`

---

## **Rate Limiting**

- Allows a maximum of **10 requests per 10 seconds** per IP address.
- If the limit is exceeded, the IP is blocked for **10 seconds**.

---

## **Project Structure**

```
url-shortener/
├── src/
│   ├── controllers/
│   │   ├── analytics.js
│   │   ├── auth.js
│   │   └── urlControllers.js
│   ├── logs/
│   ├── middlewares/
│   │   ├── authenticateToken.js
│   │   └── rateLimiter.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── urlRoutes.js
│   ├── utils/
│   │   ├── database.js
│   │   └── logger.js
│   ├── validators/
│   │   ├── analytics.js
│   │   └── urlControllers.js
├── unitTests/
│   └── urlControllers.js 
├── .dockerignore
├── .env
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── app.js
```

---

## **Testing**

- Use tools like Postman or curl to test the API endpoints.
- Unit testing is done using Mocha and Chai.
- Postman documentation: [Postman Documentation](https://documenter.getpostman.com/view/25258547/2sAYJ3F2Dk).

---

## **Deployment**

1. Deploy the application on platforms like AWS EC2, Render, or Heroku.
2. Configure your Google OAuth settings to use the deployed URL.
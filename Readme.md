# URL Shortener

A URL Shortener application built using Node.js, Express.js, and MySQL, containerized with Docker. This application allows users to shorten long URLs, track analytics, and manage links with authentication and rate limiting.

## Features

- **Shorten URLs**: Create a short and easy-to-share version of long URLs.
- **Analytics**: Track total clicks, unique clicks, and detailed information about users operating systems, devices, and geolocation.
- **Rate Limiting**: Prevent abuse by limiting requests per IP address.
- **Authentication**: Secure access using Google Sign-In.
- **Dockerized**: Easily deploy the application with Docker.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: Google OAuth 2.0
- **Rate Limiting and caching**: Redis
- **Containerization**: Docker
- **Environment Management**: dotenv
- **Logging**: Winston with daily rotating logs

## Prerequisites

- Node.js (v18 or later)
- MySQL
- Docker and Docker Compose

## Installation

1. Clone the repository:
   git clone https://github.com/your-repo/url-shortener.git
   cd url-shortener

2. Install dependencies:
   npm install

3. Configure the environment variables:
   Create a `.env` file in the root directory:
   DB_HOST=your-database-host
   DB_USER=your-database-user
   DB_PASS=your-database-password
   DB_NAME=your-database-name
   JWT_SECRET=your-jwt-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

4. Set up the database:
                          ------------------------users----------------------------------
CREATE TABLE `users` ( `id` int NOT NULL AUTO_INCREMENT, `googleId` varchar(255) NOT NULL, `displayName` varchar(255) DEFAULT NULL, `email` varchar(255) DEFAULT NULL, `picture` varchar(255) DEFAULT NULL, `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), UNIQUE KEY `googleId` (`googleId`), UNIQUE KEY `email` (`email`));
                          ------------------------urls----------------------------------
CREATE TABLE `urls` ( `id` int NOT NULL AUTO_INCREMENT, `longUrl` text NOT NULL, `shortUrl` varchar(255) NOT NULL, `topic` varchar(255) DEFAULT NULL, `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, `user_id` int DEFAULT NULL, PRIMARY KEY (`id`), UNIQUE KEY `shortUrl` (`shortUrl`));
                          ------------------------url_analytics----------------------------------
CREATE TABLE `url_analytics` ( `id` int NOT NULL AUTO_INCREMENT, `shortUrl` varchar(255) DEFAULT NULL, `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP, `userAgent` text, `ipAddress` varchar(45) DEFAULT NULL, `country` varchar(255) DEFAULT NULL, `city` varchar(255) DEFAULT NULL, `osType` varchar(255) DEFAULT NULL, `deviceType` varchar(255) DEFAULT NULL, `user_id` int DEFAULT NULL, PRIMARY KEY (`id`));

5. Start the application:
   npm start

6. (Optional) Start with Docker:
   docker-compose up --build

## Endpoints

### Authentication
- **Google Login**: `/auth/google`
- **Google Callback**: `/auth/google/callback`

### URL Management
- **Shorten URL**: `POST /api/shorten`
  - Body: `{ longUrl: string, customAlias: string (optional), topic: string }`
- **Redirect to Long URL**: `GET /api/shorten/:alias`
- **Get Analytics for a URL**: `GET /api/analytics/:alias`
- **Get Topic-Based Analytics**: `GET /api/analytics/topic/:topic`
- **Get Overall Analytics**: `GET /api/analytics/overall`

## Rate Limiting
- Allows a maximum of **10 requests per 10 seconds** per IP address.
- If the limit is exceeded, the IP is blocked for **1 minutes**.

## Project Structure

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
├── .dockerignore
├── .env
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── app.js

```

## Testing

- Use tools like Postman or curl to test the API endpoints.

## Deployment

1. Deploy the application on platforms like AWS EC2, Render, or Heroku.
3. Configure your Google OAuth settings to use the deployed URL.


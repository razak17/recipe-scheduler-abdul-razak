# Recipe Scheduler App

<!--toc:start-->
- [Reciper Scheduler](#reciper-scheduler)
  - [Overview](#overview)
  - [Technology Stack](#technology-stack)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
    - [Running with Docker Compose](#running-with-docker-compose)
    - [Running the Mobile App](#running-the-mobile-app)
  - [API Endpoints](#api-endpoints)
  - [Queue System Explanation](#queue-system-explanation)
  - [Configuration](#configuration)
<!--toc:end-->

A micro-service application that allows users to schedule cooking events and receive push notifications before the event starts.

## Overview

This application consists of:

1. **Backend API**: A Node.js REST API for managing cooking events
2. **Reminder Worker**: A service that processes reminder jobs and sends push notifications
3. **Mobile App**: A React Native (Expo) application for scheduling and managing cooking events

## Technology Stack

- **Backend**: Node.js, Express, TypeScript, SQLite
- **Queue System**: Redis + BullMQ
- **Mobile**: React Native with Expo
- **Containerization**: Docker & Docker Compose

## Features

- Create, read, update, and delete cooking events
- Schedule push notifications for upcoming events
- Light/dark theme support
- View notification history

## Prerequisites

- Docker and Docker Compose
- Node.js and npm (for local development)
- Expo Go app (for running the mobile application)

## Getting Started

### Running with Docker Compose

1. Clone the repository:
   ```
   git clone https://github.com/razak17/recipe-scheduler-abdul-razak.git
   cd recipe-scheduler-abdul-razak
   ```

2. Copy env variable
   ```
   cp .env.example .env
   ```

3. Start the services:
   ```
   docker-compose up -d
   ```

4. The API will be available at `http://localhost:8000/api`

### Running the Mobile App

1. Navigate to the mobile directory:
   ```
   cd recipe-scheduler-abdul-razak/mobile
   ```

1. Install dependencies:
   ```
   npm install
   ```

Set backend url in app.json:
   ```json
    "extra": {
      "apiUrl": "<your-url-here>",
    }
   ```

3. Start the Expo development server:
   ```
   npx expo start
   ```

4. Scan the QR code with the Expo Go app on your device or run in an emulator

## API Endpoints

- `POST /api/events` - Create a new event
- `GET /api/events?userId=<userId>` - Get all events for a user
- `PATCH /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event
- `POST /api/devices` - Register a device for push notifications

## Queue System Explanation

For this project, I chose Redis + BullMQ as the queue system for the following reasons:

1. **Reliability**: BullMQ provides a robust queuing system with features like retries, delay, and rate limiting.

2. **Performance**: Redis is an in-memory data store that offers excellent performance for queue operations.

3. **Persistence**: Redis can be configured to persist data to disk, ensuring job data isn't lost if the service restarts.

4. **Monitoring**: BullMQ provides tools for monitoring and visualizing queue status.

5. **Simplicity**: The combination is easy to set up and use within a Docker environment.

The reminder system works as follows:

1. When an event is created or updated, a job is added to the queue with a delay calculated as `eventTime - REMINDER_LEAD_MINUTES`.

2. The worker service continuously monitors the queue and processes jobs when they're ready.

3. When a job is processed, the worker sends a push notification to the user's device using the Expo Push Notification service.

## Configuration

The application can be configured using environment variables:

- `PORT` - The port the API server will listen on (default: 3000)
- `REMINDER_LEAD_MINUTES` - How many minutes before an event to send a reminder (default: 30)
- `REDIS_HOST` - The Redis host (default: 'localhost' or 'redis' in Docker)
- `REDIS_PORT` - The Redis port (default: 6379)
```

This completes the implementation of the cooking event scheduler application. The solution includes:

1. A Node.js/TypeScript backend API
2. A reminder worker using Redis + BullMQ
3. A React Native (Expo) mobile application
4. Docker and Docker Compose configuration for easy deployment

The application meets all the requirements specified:
- Users can schedule cooking events
- The system sends push notifications before events
- The frontend allows event management and theme switching
- The entire solution can be started with one `docker compose up` command


## Tests (api)

```bash
cd api
cp .env.example .env.tes
```

Change NODE_ENV in .env.test to from `development` to `test`

Run all tests with:

```bash
npm run test
```

Run integation tests with:

```bash
npm run test:integration
```

Debug your tests using Chrome DevTools or your IDE's debugger with:

```bash
npm run test:debug
```

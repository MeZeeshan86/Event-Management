# Project 4 — Online Event Registration and Management System

## Modules covered
- Student registration and login
- Event listing and category search
- Event registration
- View registered participants
- Admin dashboard
- Registration confirmation

## Run locally
```powershell
py -m http.server 5500
```
Open http://localhost:5500

Demo admin: `admin@events.test` / `admin123`.
Create a student account to register for events.

## Selenium
Run the container on port 8080 first, then:
```powershell
npm install
npm test
```
Node.js, npm and Google Chrome must be installed. Selenium 4 uses Selenium Manager to locate/download a compatible driver. The Jenkinsfile also runs these tests after deploying the container, so the Jenkins service account must be able to run Docker, Node.js, npm and Chrome.

## Docker
```powershell
docker build -t campusconnect-events:latest .
docker run -d -p 8080:80 --name campusconnect-events-container campusconnect-events:latest
docker ps
```
Open http://localhost:8080
Stop/remove:
```powershell
docker stop campusconnect-events-container
docker rm campusconnect-events-container
```

## Important limitation
This is a browser-only academic prototype. It stores data in localStorage and uses demo credentials. It has no server/database, real authentication, or email/SMS delivery. Registration confirmation appears in the application UI only. Do not enter real student data.

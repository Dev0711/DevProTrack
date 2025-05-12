# DevProTrack - Developer Productivity Tracking Tool

DevProTrack is a web-based application designed to help developers and teams measure and visualize their development productivity metrics. By connecting to version control systems like GitHub, it provides insights into coding patterns, commit frequency, pull request cycle times, and more.

## Features

- **GitHub Integration**: Connect your GitHub account to sync repositories and track development activity
- **Dashboard Overview**: View key metrics like commit frequency, code changes, and PR cycle times
- **Repository Management**: Track multiple repositories and filter which ones to include in your metrics
- **Team Analytics**: Identify productivity patterns across team members
- **Commit Statistics**: Track the volume and frequency of code contributions
- **Pull Request Metrics**: Monitor PR cycle times and completion rates
- **Scheduled Syncing**: Automatically sync data from connected repositories

## Technology Stack

### Backend

- Java 17
- Spring Boot 3.1
- Spring Security with JWT Authentication
- Spring Data JPA
- MySQL Database (production)
- H2 Database (for development)
- Maven

### Frontend

- React 18
- Vite (fast build tool and development server)
- Tailwind CSS (utility-first CSS framework)
- shadcn/ui (reusable component library)
- Chart.js (for data visualization)
- React Router (for navigation)
- Axios (for API requests)

## Getting Started

### Prerequisites

- Java 17+
- Node.js 16+
- Maven 3.8+
- MySQL 8+ (for production)

### Backend Setup

1. Navigate to the `backend` directory
2. Configure database settings in `application.properties`:

   ```properties
   # For MySQL (production)
   spring.datasource.url=jdbc:mysql://localhost:3306/devprotrack?createDatabaseIfNotExist=true
   spring.datasource.username=root
   spring.datasource.password=root

   # For H2 (development)
   # spring.datasource.url=jdbc:h2:mem:devprodata
   # spring.datasource.driverClassName=org.h2.Driver
   # spring.datasource.username=sa
   # spring.datasource.password=password
   # spring.h2.console.enabled=true
   ```

3. Run `mvn clean install` to build the project
4. Run `mvn spring-boot:run` to start the server (default port: 8082)

### Frontend Setup

1. Navigate to the `frontend-vite` directory
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the Vite development server

## Configuration

### GitHub Integration

To connect your GitHub account, you'll need to:

1. Create a personal access token on GitHub with `repo` scope
2. Add your GitHub username and token in the settings page of the application

## Security Features

- JWT-based authentication
- Password encryption with BCrypt
- Role-based authorization
- CORS configuration for secure cross-origin requests

## API Documentation

The backend exposes the following main API endpoints:

- `/auth/*` - Authentication endpoints (login, register)
- `/api/repositories/*` - Repository management
- `/api/analytics/*` - Data analytics endpoints

## Architecture

The application follows a client-server architecture:

- **Backend**: RESTful API built with Spring Boot
- **Frontend**: Single Page Application built with React and Vite
- **Database**: MySQL for data persistence

## Future Enhancements

- GitLab and Bitbucket integration
- Code quality metrics
- IDE plugin for real-time tracking
- Advanced team analytics
- Customizable reports and dashboards


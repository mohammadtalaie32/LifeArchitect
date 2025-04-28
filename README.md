# Life Architect

A personal development and self-management web application designed to help users organize thoughts, track goals, and align actions with core principles through an intuitive and interactive platform.

## Technologies

- React (TypeScript) frontend
- Express.js backend
- PostgreSQL database
- Drizzle ORM for database management

## Docker Development Setup

This project supports Docker for local development, which ensures a consistent development environment across different machines.

### Prerequisites

- Docker and Docker Compose installed on your system
- Git for version control

### Getting Started with Docker

1. **Clone the repository:**

```bash
git clone <repository-url>
cd life-architect
```

2. **Start the Docker containers:**

```bash
docker-compose up -d
```

This command starts the application and PostgreSQL database in detached mode.

3. **View application logs:**

```bash
docker-compose logs -f app
```

4. **Access the application:**

Open your browser and navigate to `http://localhost:5000`

### Development with Docker

- The application code is mounted as a volume in the Docker container, so changes you make to the code will be reflected in the running application.
- Database data is persisted in a Docker volume named `postgres_data`.

### Stopping the Containers

```bash
docker-compose down
```

To completely remove the volumes and start fresh:

```bash
docker-compose down -v
```

## Running Without Docker

If you prefer to run the application without Docker:

1. **Install dependencies:**

```bash
npm install
```

2. **Set up the database:**

Make sure PostgreSQL is installed and running on your system.
Update the `DATABASE_URL` environment variable in your `.env` file.

3. **Push the schema to the database:**

```bash
npm run db:push
```

4. **Start the development server:**

```bash
npm run dev
```

## License

[MIT License](LICENSE)
# African Job Board API

African Job Board is a comprehensive platform designed to connect African job seekers with cross-border employment opportunities, enabling companies across the continent and beyond to discover, recruit, and collaborate with top talent. The platform streamlines the job search and hiring process, supports diverse industries, and fosters economic growth by bridging the gap between skilled professionals and organizations in need of their expertise.

In addition to its robust feature set, African Job Board is built using a modern technology stack. The backend leverages NestJS, a progressive Node.js framework known for its scalability and maintainability. PostgreSQL serves as the primary database, providing reliable and efficient data storage. Database interactions are managed using Drizzle, a type-safe ORM that simplifies querying and schema management, ensuring seamless integration between the application and the database.

## Database Setup and Migrations

This project uses [Drizzle Kit](https://orm.drizzle.team/docs/overview) for managing database migrations with PostgreSQL. To streamline local development, the `apps/api` directory includes a `docker-compose.yaml` file that provisions a PostgreSQL database container.

### Prerequisites

- **Docker Desktop:** Install Docker Desktop for your operating system.

  - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - [Docker Desktop Installation Guide](https://docs.docker.com/desktop/install/)

- **Node.js and pnpm:** Ensure you have Node.js and [pnpm](https://pnpm.io/) installed.

### Environment Configuration

1. **Environment Variables:**  
   The `apps/api` directory contains a `.env.example` file listing all required environment variables, including database connection settings.

   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` as needed to match your local or remote database configuration.

2. **Docker Compose Configuration:**  
   The `docker-compose.yaml` file uses variables from your `.env` file (see the `# DATABASE Configs` section) to configure the PostgreSQL container.

### Starting the Database

From the `apps/api` directory, start the PostgreSQL container:

```bash
docker compose up -d
```

This command will run the database in the background. You can verify the container is running with:

```bash
docker ps
```

### Running Database Migrations

1. Return to the root of the project.
2. Apply database migrations using [Turborepo](https://turbo.build/):

   ```bash
   turbo db:migrate
   ```

   This will run all pending migrations using Drizzle Kit.

### Starting the API Service

After successful migration, start the API service (from the project root):

```bash
turbo dev --filter=api
```

The API should now be running and connected to your local PostgreSQL database.

### Running Database Seeding

To populate your development database with sample data, set the `DATABASE_SEEDING` environment variable to `true` when starting the API service.

From the project root, execute the following command:

```bash
DATABASE_SEEDING=true turbo dev --filter=api
```

The `--filter=api` flag is optional but recommended. It ensures that Turborepo only starts the `dev` script for the `api` workspace, as database seeding is typically exclusive to the API service.

---

**Troubleshooting:**

- If you encounter connection errors, ensure your `.env` values match the database container settings.
- For more on Drizzle migrations, see the [Drizzle Kit Migrations Guide](https://orm.drizzle.team/docs/migrations).

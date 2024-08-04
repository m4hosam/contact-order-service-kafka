Sure, here's a sample README documentation for your project:

---

# Order Service Project

This project consists of multiple services including an order service, a contact service, Kafka, Zookeeper, PostgreSQL, and MongoDB. The services are containerized using Docker and orchestrated with Docker Compose.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### Clone the Repository

```sh
git clone https://github.com/m4hosam/order-service-ascatu.git
cd order-service-ascatu
```

### Structure

- `contactService`: Directory containing the contact service.
- `orderService`: Directory containing the order service.
- `docker-compose.yml`: Docker Compose configuration file.

### Build and Run the Services

1. **Build the Docker images and start the containers**:

   ```sh
   docker-compose up --build
   ```

2. **Stopping the containers**:

   ```sh
   docker-compose down
   ```

### Accessing the Services

- **Order Service**:
  - URL: `http://localhost:3000/api/v1/order`
- **Contact Service**:
  - URL: `http://localhost:8080/api/v1/person`

### Connecting to Kafka

Kafka is used for handling events within the system. To connect to the Kafka broker, use the following configuration:

- **Bootstrap Server**: `kafka:9092`

Example connection string for a Kafka client:

```sh
docker exec -it kafka_container_id bash
cd /opt/bitnami/kafka/bin
./kafka-topics.sh --list --bootstrap-server kafka:9092
```

### Connecting to PostgreSQL

The PostgreSQL database is used to store order data. To connect to the PostgreSQL database, use the following configuration:

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `orders`
- **User**: `m4hosam`
- **Password**: `password`

Example connection string:

```sh
postgresql://m4hosam:password@localhost:5432/orders
```

### Connecting to MongoDB

MongoDB is used to store contact data. To connect to the MongoDB database, use the following configuration:

- **Host**: `localhost`
- **Port**: `27017`

Example connection string:

```sh
mongodb://localhost:27017
```

## Troubleshooting

### Common Issues

- **Kafka Fails to Start**: Ensure the ports are correctly configured and not being used by other services.
- **Database Connection Issues**: Verify that the databases are running and accessible on the specified ports.

### Checking Logs

To view logs for any service, use:

```sh
docker-compose logs <service_name>
```

For example, to view Kafka logs:

```sh
docker-compose logs kafka
```

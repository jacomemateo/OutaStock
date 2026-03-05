# OutaStock?

## Project Overview
The goal of this project is to design and build a digital system that manages the inventory of an older vending machine. The system keeps track of products, pricing, inventory levels, and transaction history in a structured and reliable way.

Transaction data is provided through a CBORD CSV log, which includes the timestamp and price of each purchase. An example format is shown below:

| DateTime | Transaction Price |
| ---- | --- |
| 2025-02-25 12:20:32 | $1.50 |
| 2025-02-25 12:21:34 | $2.25 |

The reason this system works is because each item in the vending machine has a unique price so we can perform a `price -> item` conversion.

At a high level, the system is responsible for:
* Managing a catalog of products and their prices
* Tracking which products are stocked in each vending machine slot
* Monitoring current inventory levels
* Recording all completed sales transactions
* Preserving historical pricing data at the time of sale

The project emphasizes data integrity, clear system design, and separation of responsibilities between different layers of the application (database, business logic, and user interface).

Another aim of the project is to create a modern frontend that's intuative and easy to use.

## Purpose

This project aims to simulate a real-world inventory and sales tracking system while applying core software engineering principles such as:

* Clean architecture and modular design
* Separation of concerns
* Data consistency and validation
* Scalability considerations
* Maintainability over time

## Installing
Make sure you have the following installed locally in your system:

* Go `v1.26.0`
* Docker `v28.5.2`
* npm `11.6.0`
* Air `v1.64.5`

### Running
```bash
git clone https://github.com/jacomemateo/OutaStock/
cd OutaStock

# Copy the env file
# If you don't do this nothing will work.
cp .env.example .env

# Running backend
make backend # This will start the local PostgreSQL server in a docker container
make seed # To get test data into postgresql

# Running frontend
make frontend
```

### [View Project Architecture](./docs/ARCHITECTURE.md)
### [View API Specification](./docs/API.md)

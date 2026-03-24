<div align="center">
  <a href="https://github.com/jacomemateo/OutaStock">
    <img src="res/logo.png" alt="Logo" height="180">
  </a>
  <h2 align="center">OutaStock</h2>
  <p align="center">
    Vending Machine Inventory Tracking System
    <br />
    <br />
    <a href="https://go.dev/"><img src="https://img.shields.io/badge/Go-1.26+-00ADD8?style=flat&logo=go" alt="Go Version"></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18.3+-20232A?style=flat&logo=react" alt="React Version"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.3+-007ACC?style=flat&logo=typescript" alt="TypeScript Version"></a>
    <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-18+-316192?style=flat&logo=postgresql" alt="PostgreSQL Version"></a>
    <a href="https://caddyserver.com/"><img src="https://img.shields.io/badge/Caddy-2.7+-00ADD8?style=flat&logo=caddy" alt="Caddy Version"></a>
    <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-28.5+-2496ED?style=flat&logo=docker" alt="Docker Version"></a>
  </p>
</div>
<a id="readme-top"></a>


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

### Purpose

This project aims to simulate a real-world inventory and sales tracking system while applying core software engineering principles such as:

* Clean architecture and modular design
* Separation of concerns
* Data consistency and validation
* Scalability considerations
* Maintainability over time

## Development (macOS) 🖥️

### Prerequisites

Clone the repository:

```bash
git clone https://github.com/jacomemateo/OutaStock/
cd OutaStock
```

Ensure the following tools are installed:

* Go `v1.26.0`
* Docker `v28.5.2`
* Node (NPM) `v11.6.0`
* Task `v3.49.1`
* Air `v1.64.5`

Install them via Homebrew:

```bash
brew install go
brew install docker
brew install node
brew install go-task/tap/go-task
brew install go-air
```

---

### Running the Development Environment

Open three terminal sessions to monitor each service independently:

```bash
task dev-back
task dev-front
task dev-docker
```

If the environment becomes unstable or services fail to start correctly, reset the Docker state:

```bash
task dev-nuke
```

---

### Code Formatting 🧹

Install formatting tools:

```bash
go install mvdan.cc/gofumpt@latest
go install golang.org/x/tools/cmd/goimports@latest
```

Identify unused dependencies and Format and clean imports:

```bash
task pretty
```

---

### Top contributors:

<a href="https://github.com/jacomemateo/OutaStock/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=jacomemateo/OutaStock" alt="contrib.rocks image" />
</a>


## [View Project Architecture](./docs/ARCHITECTURE.md)

## [View API Specification](./docs/API.md)

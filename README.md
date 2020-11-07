# Murakami

A lightweight, open-source membership management system for [SHRUB](https://shrubcoop.org)!

> Version 2.2

[![DeepScan grade](https://deepscan.io/api/teams/2524/projects/3660/branches/32113/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=2524&pid=3660&bid=32113)

Murakami is straight-to-the-point. It allows an organisation to _easily_ manage its members and volunteers, integrating seemlessly with a bespoke POS system.

### Key features:

- Simple, GDPR-compliant membership management.
- Automated, customizable email communications with members, volunteers and customers.
- Management of volunteers - dynamically create and assign roles, coordinators and working groups.
- Manage volunteer hours
- Fully integrated and customizable till system. Can take card transactions through SumUp.
- Manage and record outgoing weights which can be used to calculate carbon savings (also integrated with till).
- Fully configurable user permissions.

# Contributing

### Requirements

- NodeJS
- NPM
- MySQL

## Set Up

- Clone the repo and install dependencies:

```sh
~ $ git clone https://github.com/honeypieio/murakami
~ $ cd murakami
~/murakami $ npm install
```

- Make a copy of .env.sample called .env, and fill out the details

- Create an instance of the database:

```sh
npm run db-create
npm run db-migrate
```

### Database & ORM

As mentioned, MySQL is used. The ORM used is `sequelize`. The following helper scripts are implemented in the `package.json`:

- `npm run db-create` - Create a fresh database
- `npm run db-destroy` - Destroy the existing database (fresh start?)
- `npm run db-migrate` - Run existing migrations
- `npm run db-downgrade` - Downgrade last migration

### Unit Testing

[WIP]

- `npm run tests`

For more detailed debug info:

- `npm run tests --verbose`

### Running

The `server.js` file will run the server when called. There is a `package.json` script for this too:

- `npm run start`

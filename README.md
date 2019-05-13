# Murakami

A lightweight, open-source membership management system for [Shrub](https://shrubcoop.org)!
If you are interested in using/adapting Murakami for your organisation or simply want to know more, feel free to [get in touch](mailto:hello@rosshudson.co.uk) :-)

> Version 2.1

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
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

### Requirements

- NodeJS
- NPM
- MySQL

# Contributing

## Set Up
- Clone the repo

```sh
~ $ git clone https://github.com/honeypieio/murakami
~ $ cd murakami
~/murakami $ npm install
~/murakami $ nano .env
```

- Create the databases from the `.sql` files in `./schemas`

- Make a copy of .env.sample called .env, and fill out the details

## Running Locally

```sh
~/murakami $ node server.js
```

## Quick Start

### Database & ORM

As mentioned, MySQL is used. The ORM used is `sequelize`. The following helper scripts are implemented in the `package.json`:

* `npm run db-create` - Create a fresh database
* `npm run db-destroy` - Destroy the existing database (fresh start?)
* `npm run db-migrate` - Run existing migrations
* `npm run db-downgrade` - Downgrade last migration

### Unit Testing

[WIP]

* `npm run tests`

### Running

The `server.js` file will run the server when called. There is a `package.json` script for this too:

* `npm run start`

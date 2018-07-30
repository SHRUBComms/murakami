# Murakami
A lightweight, open-source membership management system for [Shrub](https://shrubcoop.org)!
If you are interested in using/adapting Murakami for your organisation or simply want to know more, feel free to [get in touch](https://honeypie.io/contact) :-)
[Demo](https://shrub.space/murakami)
> Version 2.0

Murakami is straight-to-the-point - it facilitates the following features with little to no faff:
*  Membership
    * Members can be added to the system with ease
    * The system keeps track of each membership including - but not limited to - contact details, membership dates, volunteer status, how often they use the swapshop etc.
    * Memberships can be renewed in two clicks!
    * Members are automatically emailed at various points in their membership
* Volunteering
    * Murakami also keeps track of Shrub's volunteers - volunteers log their hours with the working group they volunteered for. Hours are then approved or rejected by an admin of said working group. If approved the member will be automatically credited with some tokens if said working group chooses to do this for their volunteers
* Transactions
    * Shrub gives their members "tokens" when they bring in donations which can then be used to "purchase" other items in their shop - AKA swapping. Volunteers may also be given tokens for volunteering. Murakami effortlessly integrates these transactions into each member's page. It is as easy as entering the category, value, and weight of each item in the transaction
* Carbon calculations
    * When an item leaves the swapshop its weight is logged with the transaction - this is then used to calculate how much carbon Shrub has been saved as a result
* Analytics
    * Based on the data stored by the above features, Murakami can create insightful statistics to help Shrub better understand its membership
* User system
    * Murakami makes use of 2 distinct classes of users - normal and administrator
    * A normal user is mainly, if not exclusively, used by the person on the till in the swapshop. They can only view members (contact details are hidden), add members and log hours for review by an admin.
    * An administrator has full access to the system - including reports, settings, managing email templates, managing users and managing working groups (review requests to join, volunteer hours, add members etc). Every admin can be assigned to multiple working groups or none at all

## Roadmap
* Volunteer availability
* Implement analytics
* Implement ability to change working group information on-the-fly

### Requirements
* NodeJS
* NPM
* MySQL

### Installation

* Import schema to databases (db/murakami.sql). 3 databases should be created:
    1. murakami
    2. murakami_testing
    3. murakami_dev

```sh
~ $ git clone https://github.com/honeypieio/murakami
~ $ cd murakami
~/murakami $ npm install
~/murakami $ nano .env
```
* Input your mail, database, Mailchimp, and reCaptcha credentials. Be sure to set your `NODE_ENV` and `PORT`.

### Deployment

```sh
~/murakami $ nodemon server.js
```
* Go to `localhost:PORT` in your browser
* Login with the test account (username: test.admin, password: swapshop)
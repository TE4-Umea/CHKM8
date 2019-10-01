# Tidsapp av Happy Surfers

## Servers

Production branch - https://chk.ygstr.com (Webhooked)

Dev branch - https://dev.chk.ygstr.com (Webhooked)

## Installtion

### Prerequisites

* NodeJS
* MySQL

### Setup database, config and node server

1. Import the database `mysql -u username -p < database.sql`
2. Install all NPM dependencies `npm install`
3. Start it and then stop it `sudo node index.js`
4. Configure mysql and web-port `config.json`
5. Run tests and make sure everything checks out ```npm test```

## Tests

Run tests with the command ```npm test```

All tests are located in ```/test/test.js```.

## Sructure

All webpages (except docs) is written in PUG, they are found in ```/views```

```/press``` is for images, source psd/ai or concept-art that is not displayed on the website. This can also be logo guides. 

Tests are located in ```/test/test.js```


## Resources

Wiki docs https://github.com/te4umea2019/Tidsapp-HS/wiki

Trello board https://trello.com/b/hxbEuuSt/chkm8

## Diagram
![](press/diagram.png)


## MySQL tables

**Important: When storing the date, store it in ms since epoch, ```Date.now()```**

#### Users
name | type | special | description
--- | --- | --- | ---
id | int | AUTO_INCREMENT, PRI | ID of the user
username | text |none | User choosen name
name | text | none | Full name of the user
avatar | text | none | Link of the username
email | text | none | Email of the user
access_token | text | none | Access token given by slack, used to update user information
admin | int | none | Boolean(0-1) if the user is an admin or not.
created | BigInt | none | The date the user was created

#### Checks
name | type | special | description
--- | --- | --- | ---
id | int | AUTO_INCREMENT, PRI | ID of the check
user | id |none | ID of the user
check_in | int | none | Boolean(0-1) if the it was a check in (otherwise check out)
project | text | NULL | Name of the project
date | BigInt | none | Date of the
type | text | none | Check in type (web, card, TOP SECRET)

#### Tokens

name | type | special | description
--- | --- | --- | ---
id | int | AUTO_INCREMENT, PRI | ID of the token
user | id |none | ID of the user
token | text | none | Token

#### Projects

name | type | special | description
--- | --- | --- | ---
id | int | AUTO_INCREMENT, PRI | ID of the project
name | text | none | Name of the project

#### Joints (table name subject to change ??)
List of who has joined what team and how much work they have done (in hours / minutes)

name | type | special | description
--- | --- | --- | ---
id | int | AUTO_INCREMENT, PRI | ID of the joint
project | text | none | Name of the project
user | int | none | ID of the user
work | BigInt | none | Work done in ms (1 hour of work = 3600000)
date | BigInt | none | Date of joining the project

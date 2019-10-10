# Tidsapp av CheckMate

## Websites

Production branch - https://chk.ygstr.com (Webhooked)

Dev branch - https://dev.chk.ygstr.com (Webhooked)

## Installtion

### Prerequisites

* NodeJS
* MySQL

### Setup database, config and node server

1. Import the database `mysql -u username -p < database.sql`
2. Install all NPM dependencies `npm i`
3. Start it and then stop it `sudo node index.js`
4. Configure mysql and web-port `config.json`
5. Run tests and make sure everything checks out ```npm test```

## Tests

Run tests with the command ```npm test```

All tests are located in ```/test/test.js```.

## Build docs

Build docs by running ```npm docs``` in src folder.

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
username | varchar | NULL | User choosen name
name | varchar | NULL | Full name of the user
password | varchar | NULL | Password
created | timestamp | NULL | The date the user was created
admin | tinyint | NULL | Boolean(0-1) if the user is an admin or not
email | varchar | NULL | Email of the user
avatar | varchar | NULL | Link of the username
access_token | varchar | NULL | Access token given by slack, used to updater information
slack_id | varchar | NULL | ID from slack
slack_domain | tinytext | none | Slack domain

#### Checks
name | type | special | description
--- | --- | --- | ---
id | int | AUTO_INCREMENT, PRI | ID of the check
user | int | NOT NULL | ID of the user
check_in | tinyint | NOT NULL | Boolean(0-1) if the it was a check in (otherwise check out)
project | int | NULL | Name of the project
date | timestamp | NOT NULL | Date of the project
type | int | NULL | Check in type (web, card, TOP SECRET)

#### Tokens

name | type | special | description
--- | --- | --- | ---
id | int | AUTO_INCREMENT, PRI | ID of the token
user | int | NOT NULL | ID of the user
created | timestamp | NOT NULL | The date the token was created
ip | varchar | NOT NULL 
token | varchar | NOT NULL | Token

#### Projects

name | type | special | description
--- | --- | --- | ---
id | int | AUTO_INCREMENT, PRI | ID of the project
name | text | none | Name of the project
created | timestamp | NULL | The date the project was created
owner | int | NULL | Boolean(0-1) if the user is the owner or not
color_top | text | none | Top color
color_bot | text | none | Bottom color

#### Joints (table name subject to change ??)
List of who has joined what team and how much work they have done (in hours / minutes)

name | type | special | description
--- | --- | --- | ---
id | int | AUTO_INCREMENT, PRI | ID of the joint
project | int | NULL | Name of the project
user | int | NULL | ID of the user
work | bigint | NULL | Work done in ms (1 hour of work = 3600000)
date | timestamp | NOT NULL | Date of joining the project

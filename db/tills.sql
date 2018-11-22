CREATE TABLE entity (
    entityType VARCHAR(10) CONSTRAINT type CHECK (entityType = 'member' OR entityType = 'company'OR entityType = 'non-member'),
    entityID VARCHAR(250),
    PRIMARY KEY(entityID)
)


CREATE TABLE company(
    entityID VARCHAR(250) REFERENCES entity(entityID),
    companyName VARCHAR(250),
    contactName VARCHAR(250), /*not required*/
    email VARCHAR(250),
    phone_no VARHCAR(15),

    PRIMARY KEY(entityID, email) /*is email the only way for contact?*/
)

CREATE TABLE transactions(
    transaction_id VARCHAR(250),
    itemId VARCHAR(250) REFERENCES stock(itemId),
    senderORreciever VARCHAR(250) REFERENCES entity(entityID),
    proof ___ /*Im unsure how you want to do proof*/
    quantity INT,
    itemTransDate DATE,
    price INT,
    sale BOOLEAN, /*says if money going into or outof SHRUB*/
    recieved BOOLEAN, /*tracks ongoing orders to avoid duplicates*/
    PRIMARY KEY(itemTransID)
)

CREATE TABLE item(
    itemId VARCHAR(250),
    itemName VARCHAR(250),
    itemDesc VARCHAR(250),
    categoryId VARCHAR(25),
    supplierItemCode VARCHAR(250),
    supplierCode VARCHAR(25),
    supplier VARCHAR(250) REFERENCES entity(entityID),
    PRIMARY KEY(itemID)
)

CREATE TABLE stock(
    itemID VARCHAR(250),
    quantity INT,
    minThreshold INT,
    maxThreshold INT,
    stocked BOOLEAN, /* CHECK (quanity > threshold )*/
    displayed BOOLEAN,
    PRIMARY KEY(itemID)
)

CREATE TABLE itemCategories(
    name VARCHAR(250),
    categoryId VARCHAR(25),
    parent VARCHAR(25),
    PRIMARY KEY(category_id)
)


CREATE TABLE locationBook(
    locBookID VARCHAR(250),
    location VARCHAR(250) REFERENCES location(name),
    renter VARCHAR(250) REFERENCES entity(entityID),
    proof ___ /*Im unsure how you want to do proof*/
    bookingDateStart DATE,
    bookingDateEnd DATE,
    price INT,
    needHelp BOOLEAN,
    peopleNeeded INT,
    PRIMARY KEY(locBookID)
)


CREATE TABLE location(
    name VARCHAR(250),
    timesAvailable TIME, /*when the place is open to be used not availability with bookings in mind*/
    PRIMARY KEY(name)
)

CREATE TABLE helpsAtGeneral(
    memberID VARCHAR(250) REFERENCES member(entityID),
    jobID VARCHAR(250), /*then use select statements to make applicable to location trans*/
    confirmedAttendance BOOLEAN,
    tokensEarned INT,
    dateJob DATE,
    hours INT,
    PRIMARY KEY(memberID, jobID)
)

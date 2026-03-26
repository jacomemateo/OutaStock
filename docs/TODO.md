# TODO
## Backend
- [ ] Make it so `product_info` and `transactions` GET methods support pagination. By which I mean we should be able to pass in 2 parameters a `page` and `limit`. If we have 25 rows and we pass in `limit=10` `page=0` then it should return the first 10 rows, `limit=10` `page=1` should return rows 11-20, and `limit=10` `page=2` should return rows 21-25 since 25 is the last row. If we try to do `limit=10` `page=3` or `limit=10` `page=9999` it should return the same as running `limit=10` `page=2`, rows 21-25.
  - [ ] Update DB schema
  - [ ] Update handler
  - [ ] Update service
  - [ ] Update frontend to take this into account
- [ ] Testing (i think this is all integeration testing)
  - [ ] Learn how to set up testing
    - [ ] Postgres Mock DB with Docker
    - [ ] Go testing module/maybe use some community testing packages
  - [ ] Transactions 
    - [ ] `GET /api/transactions/recent`
      - [ ] test pagination & success response
      - [ ] test invalid limit param
      - [ ] test min and max
      - [ ] test passing no limit
      - [ ] test with no data in db, should return an error
  - [ ] Inventory
    - [ ] `GET /api/inventory/all`
      - [ ] test success response
      - [ ] test empty inventory, i.e. all cols are NULL but `slot_id` and `slot_label`
    - [ ] `PATCH /api/inventory/:slotID`
      - [ ] test passing in invalid slotID
      - [ ] test assigning with non existent product UUID, should return error
      - [ ] test assinging negative quantity
      - [ ] test with extra invalid JSON field
      - [ ] test deleting slot success
  - [ ] Products
    - [ ] `GET /api/products/all`
      - [ ] test success response
    - [ ] `POST /api/products/new`
      - [ ] test with one field missing from json request body
      - [ ] test  with extra invalid json field
      - [ ] test with incorrect types
      - [ ] test new success
    - [ ] `PATCH /api/products/:productID`
      - [ ] test with non existent UUID
      - [ ] test passing in empty json body
      - [ ] test updating name success
      - [ ] test updating price success
      - [ ] test with extra invalid json field
      - [ ] test with invalid datatypes
    - [ ] `DELETE /api/products/:productID`
      - [ ] test with non existent UUID
      - [ ] test success
  - [ ] Config file, make ENV more robust

## Database
- [ ] I don't know if it's nesceary but maybe test the constraints we added in the DB schema?

## Frontend
- [x] Update inventory API 

## Docs
- [x] Update inventory get api to reflect changes, right now it should be broken.


## Docker
- [x] Create dockerfile for backend
  - [x] Make sure it works with env variables
- [x] Create dockerfile for frontend
- [x] Create docker-compose.yml for project
  - [x] Actually split them into a docker-compose.dev.yml and docker-compose.prod.yml

## Deployment
- [x] Learn how to set up automatic updates, i.e. we send push to the github, something in the server is listening for that and pulls it and all the docker containers automatically update magically

## Authenthication (LogTo)
- [ ] [LogTo](https://logto.io/) Website
- [ ] Learn how to integrate

## User Profiles
- [ ] Learn how to add user profiles
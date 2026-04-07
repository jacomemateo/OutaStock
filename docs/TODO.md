# TODO
## Backend
- [x] Make it so `product_info` and `transactions` GET methods support pagination. By which I mean we should be able to pass in 2 parameters a `page` and `limit`. If we have 25 rows and we pass in `limit=10` `page=0` then it should return the first 10 rows, `limit=10` `page=1` should return rows 11-20, and `limit=10` `page=2` should return rows 21-25 since 25 is the last row. If we try to do `limit=10` `page=3` or `limit=10` `page=9999` it should return the same as running `limit=10` `page=2`, rows 21-25.
  - [x] Update DB schema
  - [x] Update handler
  - [x] Update service
  - [x] Update frontend to take this into account
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
- [x] [LogTo](https://logto.io/) Website
- [x] Learn how to integrate

## User Profiles
- [ ] Learn how to add user profiles

## Prompt
I have changed the dockerfile and the taskfile so that it only works in "prod" mode now. Zitadel and the backend connect perfectly, no issues there. The issue I do have is that this is very very slow for development. Since now every time I make a change in the go backend or in the react frontend I have to re-deploy the whole docker application which takes 10 seconds PER launch!!

I was using air (as you can see my air.toml config file) by simply running "air" from the root dir (air config is perfect you probably don't have to touch that) and vite by running "npm run dev" from the web/ folder. Obviusly those two don't work now since all the services are so tighly integrated with docker.

One approach that I was thinking about is to add profiles to the docker-compose.yml services backend, and frontend, so that I can run them only when passing some "prod" flag. Although this may work, we still have the issue of CORS, and making sure the whole zitadel applcaition also work in development mode.

Another thing that we have to keep in consideration is that for development mode some of the enviroment variables are going to be different.

The last issue comes from the docker networking + caddy, since most of the services are configured to communicate with each other thru the internal docker network.

Can you please help me fix this? The end result I want is for the prod command to stay the exact same and to have a single dev command in the Taskfile that will launch everything except for the frontend and backend services since i'll be running those with air and vite. Is this possible?
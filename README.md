# Honk :duck: :swan:

Honk, like a goose. ![A plain black goose shaped logo](extension/icons/honk-32.png)  
A KISS personal password manager.  
Not meant to be taken too seriously. This is a small pet project for my own entertainment. 

It involves:
  - ~~Golang~~ Crystal lang written api
  - A browser extension with react & typescript

## API Deployment

Ensure DNS are set up correctly and server is reachable from internet on port 80 for certificates generation.  

Run `docker-compose -e CREATE_USER= -e CREATE_PASSWORD= -e HTTPS_ACME_EMAIL= -e DOMAIN= --env-file env.local up`  
`CREATE_USER=` to create a user if it does not already exists. Optionnal.  
`CREATE_PASSWORD=` the password of the user to create. Mandatory if `CREATE_USER` is set.  
`DOMAIN` will be the domain name of the api.  
`HTTPS_ACME_EMAIL` is the email used for ACME registration performed by Caddy to obtain certificates.  

Note that provided docker compose and env files are setup for testing purpose.   

## Extension

Built and tested for firefox.  
go in the `extension` directory and run `npm i; npm run prod-build`.  
The extension will be found in `dist/honk.zip`

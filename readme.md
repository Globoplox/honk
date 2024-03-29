# Honk :duck: :swan:

Honk, like a goose. ![A plain black goose shaped logo](extension/icons/honk-32.png)  
A KISS personal password manager.  
Not meant to be taken too seriously. This is a small pet project for my own entertainment. 

It involves:
  - ~~Golang~~ Crystal lang written api
  - A browser extension with react & typescript

## API Deployment

Run the interactive script `setup.sh` once to bootstrap certificates and dns to your taste. This is required only once. 
It assumes you're running it on a up to date archlinux based system.

Then run `docker-compose --env-file env.local up --build` to start everything.

## Extension

Built and tested for firefox.  
go in the `extension` directory and run `npm i; npm run prod-build`.  
The extension will be found in `dist/honk.zip`

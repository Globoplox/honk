# Honk :duck: :swan:

Honk, like a goose. ![A plain black goose shaped logo](extension/icons/honk-32.png)  
A KISS personal password manager, by me for me.  
Not meant to be taken too seriously. This is a small pet project 
and pretext for learning the basics of golang and looking at web extensions.  

It involves:
  - Golang written api
  - Browser extension

The backend is a simple basic passowrd authentication go crud json api for 'passwords' which are tagged, named bunch of text.  
There are ZERO cipher on backend side. Name and tags are expected to clear text.  
The data are expected to be pre-ciphered by the client.  

The extension handles symetric de/ciphering of the data.  
Implementation details for implementing a cipher compatible alternative client:
- Ciphertext is expected to be a json object of this form `{"data": "...", "iv": "...", "salt": "..."}`
- data, iv, and salt are hexstrings
- data is the original text ciphered through AES-GCM with the given iv
- Cipher key is derived from a user provided password through PBKDF2 with the given salt
- See [crypto.js](/extension/crypto.js)

In the implemented extension client use a single password and expect the account password to be a salted hash of the cipher password.  
The cipher password never leave the browser.  

Data can be anything text, so passwords, notes, keys, certificates...  
There are no form-prefill, no automatic search based on the current domain.  

## Todo
- [ ] Api user email field
- [ ] Api user update
- [ ] Api user create limitation (local only ?)
- [ ] Search pagination

### Todo for fun
- [ ] JSX and nicer extension bundling
- [ ] Idiomatic and nicer golang

## Usage

Its not done yet, so who knows.

## API Deployment

### Docker

This is for development or testing, not production. Running in production will require addition tinkering to make is safe and practical.  
Run the interactive script `setup.sh` once to bootstrap certificates and dns to your taste. This is required only once. 
It assumes you're running it on a up to date archlinux based system.

Then run `docker-compose --env-file env.local up --build` to start everything.

#### I'm not using arch or linux at all

Here is what the setup script does, that you will need or want to do manually:
- Ask for a certficate authority and its key, or create them if none are provided. They will be created or in copied `certs/ca.key` and `certs/ca.crt`
- Ask for the domain name to use. Default to `honk.lan` if none is provided.
- Creates a ssl in `certs/honk.crt` for the previously given domain.
- Create a copy of env.local.template as env.local filled with needed values
- Create a copy of nginx.conf.template as nginx.conf filled with needed values
- Optionnaly, update the `/etc/hosts` file
- Optionnaly, install the created certificate authority if any

## Manual

You can figure it out yourself.
The requirment can be found easely by looking at the docker-compose file and env.local.template .

## Extension

Built and tested for firefox.  
go in the `extension` directory and run `npx webpack`. You will need npm.  
The extension will be found in `dist/honk.zip`

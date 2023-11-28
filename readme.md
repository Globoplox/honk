# Honk

Honk, like a goose
A KISS personal password manager, by me for me.
It must:
  - Allow to save and retrieve passwords
  - On all my devices
  - Safely, without risk of interception
  - With a good availability
  - With the lowest possible risk of loosing my passwords
  - Easy and cheap to host
Done because current offer of password manager is unstaisfying, it's easy, invlovle interesting topics (availablity and data safekeep) that I will have a personal intereset in pursuing.
It'a good opportunity to use/learn new technologies that I have an interest in.

 You shouldn't use it seriously. It's just a less good synced keepass with extra steps.

It involves:
  - Go written api (I want to learn go)
  - The upkeep it needs (reverse proxy, database, ops tooling)
  - The hosting (my own physical server, dns, tls certs)
  - Browser extension that works on mobile

## Todo
- Api user email field
- Api user update

## Usage

Its not done yet, so who knows.
Also:
> You shouldn't use it seriously. It's just a less good synced keepass with extra steps.  

## Deployment

### Docker

This is for development or testing, not production. Running in production will require addition tinkering to make is safe and practical.  
Run the interactive script `setup.sh` once to bootstrap certificates and dns to your taste.  This is required only once.  
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

Not yet. Probably never, you can figure it out yourself.
If you cant you're not responsible enough to mindfully use a makeshift password manager found on internet.
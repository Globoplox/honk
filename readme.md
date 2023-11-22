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

It involves:
  - Go written api (I want to learn go)
  - The upkeep it needs (reverse proxy, database, ops tooling)
  - The hosting (my own physical server, dns, tls certs)
  - Browser extension that works on mobile

## Design

This is a draft:

Design after thinking about it for five minutes:
  SCRUD for a username/name/account/password entry
  CRUD for users ?
  Password are symetricly cyphered with the user master password before reaching api (note: does browser extensions can symetryc cipher with no hassle ?)
  Upon addition/update or at a reguler pace, additionaly to normal backup management, all the passwords are bundled (they are still ciphered with the master password), asymetricaly ciphered and sent
    by mail to me. This way I strongly reduce the risk of losing eveyrthing and it make disruption more noticeable (added a password, no mail ? Issue. Still have the generated password in mind or in clipboard).
  The private key for deciphering is kept a secret from avery actor but my physical person. Saas can't beat this
  The private key cipher is usful in case the master password is compromised, so maybe it's not that usefull.

  Having a multi-user environment is not usefull in my case but I feel like I should stay.
  There must be some kind of auth, even if the password are bound to the master password, because:
  - list of existing password is sensitive,
  - account names are sensitive (technicaly could be ciphered, probably should)

  ## Usage

  Its not done yet, so who knows

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

Not yet.
#!/bin/bash

mkdir -p certs
CREATED_CA=""

# $1 name, $2 dns
function issue_certificate {
  rm -f "certs/ca.srl"
  openssl genrsa -out "certs/$1.key" 4096
  openssl req -new -key "certs/$1.key" -out "certs/$1.csr" -subj "/CN=Honk local $1/C=FR/ST=Paris/L=Paris/O=Honk"
  cat << EXT > "certs/$1.ext"
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = $2
EXT
  openssl x509 -req -in "certs/$1.csr" -CA "certs/ca.crt" -CAkey "certs/ca.key" -CAcreateserial -out "certs/$1.crt" -days 365 -sha256 -extfile "certs/$1.ext"
} 

if [ ! -f "certs/ca.key" ]; then
  echo -n "Path to certificate authority key [none]: "
  read CA_KEY_PATH
  if [ -z "$CA_KEY_PATH" ]; then
    echo "No certificate authority key provided, creating one"
    openssl genrsa -out certs/ca.key 2048
  else
    cp "$CA_KEY_PATH" "certs/ca.key"
  fi
fi

if [ ! -f "certs/ca.crt" ]; then
  echo -n "Path to certificate authority certificate [none]: "
  read CA_CERT_PATH
  if [ -z "$CA_CERT_PATH" ]; then
    echo "No certificate authority certificate provided, creating one"
    openssl req -x509 -new -nodes -key certs/ca.key -sha256 -days 1826 -out certs/ca.crt -subj '/CN=Auth Local CA/C=FR/ST=Paris/L=Paris/O=Authentitea'
    CREATED_CA="true"
  else
    cp "$CA_CERT_PATH" "certs/ca.crt"
  fi
fi

if [ -z "$ROOT_DNS" ]; then
  echo -n "Root domain name [honk.lan]: "
  read ROOT_DNS
  if [ -z "$ROOT_DNS" ]; then ROOT_DNS=honk.lan; fi
fi


if [ ! -f "certs/honk.crt" ]; then
  issue_certificate "honk" "$ROOT_DNS"
fi

cp env.local.template env.local
cp nginx.conf.template nginx.conf

sed -i "s/ROOT_DOMAIN/$ROOT_DNS/" env.local
sed -i "s/FORWARDED_TOKEN/$FORWARDED_TOKEN/" env.local

sed -i "s/ROOT_DOMAIN/$ROOT_DNS/" nginx.conf
sed -i "s/FORWARDED_TOKEN/$FORWARDED_TOKEN/" nginx.conf

while true; do
    read -p "Update /etc/hosts (yes/no): " yn
    case $yn in
        [Yy]* ) 
          echo -e "127.0.0.1 $ROOT_DNS" | sudo tee -a /etc/hosts;
          break;;
        [Nn]* ) break;;
        * ) echo "Please answer yes or no.";;
    esac
done

if [ ! -z "$CREATED_CA" ]; then
while true; do
    read -p "Install the CA (yes/no): " yn
    case $yn in
        [Yy]* ) 
          sudo trust anchor --store certs/ca.crt
          break;;
        [Nn]* ) break;;
        * ) echo "Please answer yes or no.";;
    esac
done
fi

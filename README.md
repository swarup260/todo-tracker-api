# todo-tracker-api
Ultimate Todo App

## List Of Npm Command 

```bash

npm run dev  #dev server

```

[postman collection](https://www.getpostman.com/collections/22de85c50abe931146a2)

[new postman habit collection](https://www.getpostman.com/collections/eb7a281bcded0fe06fd2)

## RoadMap 

### Version 1.1
- [x] Todo Users Api
- [x] Todo Curd Api
### Version 1.2
- [x] Habit Tracker Api
- [x] Project Management Api
- [x] Project Notes Api
### Version 1.3
- [x] Notes comment CRUD API
- [ ] Project Activity Tracker integration in Project Management Api
### Version 1.4
- [ ] Todo Extended Deadline Tracker
### Version 1.5
- [ ] User Sharing 
- [ ] ACL User Sharing 



## RoadMap Optional

- [X] Docker
- [ ] ElasticSearch


## JWT RSA Key Generated Command

```bash

ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
# Don't add passphrase
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub

ssh-keygen -e -m PKCS8 -f jwtRS256.key.pub > jwtRS256pk.key.pub #Public key needs to be in PKCS8 (OpenSSL default) format. 

```

## JWT ECDSA Key Generated Command

```bash

openssl ecparam -name secp256k1 -genkey -noout -out ec-secp256k1-priv-key.pem #private key

openssl ec -in ec-secp256k1-priv-key.pem -pubout > ec-secp256k1-pub-key.pem #public key

```






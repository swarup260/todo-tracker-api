FROM node:14

# Create directory
RUN mkdir -p /usr/src/app

# Create app directory
WORKDIR /usr/src/app


COPY package*.json /usr/src/app/

RUN npm i

# Bundle app source
COPY . /usr/src/app/

EXPOSE 3000

CMD [ "npm", "start" ]
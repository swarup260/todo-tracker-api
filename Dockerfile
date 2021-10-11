FROM node:14

# Create directory
RUN mkdir -p /usr/src/app

# Create app directory
WORKDIR /usr/src/app

COPY package*.json /usr/src/app/

ARG NODE_ENV

RUN if [ "$NODE_ENV" = "development" ]; \
    then npm i; \
    else npm i --only=production; \
    fi

# Bundle app source
COPY . /usr/src/app/

ENV PORT=3000

EXPOSE ${PORT}

CMD [ "npm", "run","dev"]
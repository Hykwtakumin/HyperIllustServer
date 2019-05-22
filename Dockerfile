FROM node:12.2.0-alpine
WORKDIR /workspace
RUN apk update --no-cache \
    && apk add make git curl bash
COPY package.json package-lock.json /workspace/
RUN npm install
COPY . /workspace
RUN make build-js
CMD make start
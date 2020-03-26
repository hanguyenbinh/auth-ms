FROM node:12-alpine as builder

RUN apk --no-cache add --virtual builds-deps build-base python

ENV NODE_ENV build

USER node
WORKDIR /home/node

COPY . /home/node

RUN npm ci \
    && npm run build

# ---

FROM node:12-alpine

RUN apk --no-cache add --virtual builds-deps build-base python

ENV NODE_ENV development

USER node
WORKDIR /home/node

COPY --from=builder /home/node/config.*.yaml /home/node/
COPY --from=builder /home/node/package*.json /home/node/
COPY --from=builder /home/node/dist/ /home/node/dist/
COPY --from=builder /home/node/email_template/ /home/node/email_template/

RUN npm ci

CMD ["node", "dist/main.js"]
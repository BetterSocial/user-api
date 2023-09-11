FROM node:18.17.1

USER node

WORKDIR /code
COPY --chown=node:node package*.json /code

RUN npm install

COPY --chown=node:node . .

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "run", "start"]

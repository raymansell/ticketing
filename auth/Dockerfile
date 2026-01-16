FROM node:24-alpine

USER node

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm install && npm cache clean --force

# allows to run tools installed as dev dependencies without having to specify the full path
ENV PATH=/app/node_modules/.bin/:$PATH 

COPY --chown=node:node . .

CMD ["tsx", "watch", "src/index.ts"]

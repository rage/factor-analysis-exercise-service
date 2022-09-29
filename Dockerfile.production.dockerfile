FROM eu.gcr.io/moocfi-public/project-331-node-base:latest as builder

RUN apt-get update \
  && apt-get install -y build-essential vim \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app && chown -R node /app

USER node

WORKDIR /app

COPY --chown=node package.json /app/
COPY --chown=node package-lock.json /app/

RUN npm ci

COPY --chown=node . /app

RUN rm -r /app/system-tests

RUN npm run build

FROM eu.gcr.io/moocfi-public/project-331-node-base:latest as runtime

COPY --from=builder /app/.next/standalone /app
COPY --from=builder /app/.next/static /app/.next/static

USER node

WORKDIR /app

EXPOSE 3002

ENV PORT 3002

CMD [ "npm", "run", "start" ]

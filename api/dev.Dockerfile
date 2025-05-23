FROM node:22.1.0

WORKDIR /app

COPY shared/package*.json /app/shared/

WORKDIR /app/shared

RUN npm install

COPY api/package.json api/package-lock.json api/tsconfig.json /app/api/

WORKDIR /app/api

RUN npm install

WORKDIR /app/api

EXPOSE 8000

EXPOSE 9229

CMD ["npm", "run", "dev"]

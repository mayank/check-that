FROM node:12-alpine as builder
WORKDIR /app
ADD package.json package-lock.json tsconfig.json tsconfig.build.json /app/
RUN npm i


FROM builder as production
ADD ./src/ /app/src
RUN npm run build

CMD ["npm", "run", "start:prod"]



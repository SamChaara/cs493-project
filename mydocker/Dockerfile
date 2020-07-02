FROM node:12
WORKDIR /usr/wrc/app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT=8000
EXPOSE ${PORT}
CMD [ "npm", "start" ]
FROM node:14-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . /
EXPOSE 3710
CMD ["tsc -p .", "node", "dist/index.js"]
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
# Command to start your Nest.js application
CMD ["npm", "run", "start:dev"]
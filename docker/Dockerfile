FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build  # If adding TS

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app ./
EXPOSE $PORT
CMD ["npm", "start"]
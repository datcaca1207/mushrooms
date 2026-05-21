FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY prisma ./prisma
RUN NODE_TLS_REJECT_UNAUTHORIZED=0 npx prisma generate

COPY src ./src

EXPOSE 4010
CMD ["npm", "start"]

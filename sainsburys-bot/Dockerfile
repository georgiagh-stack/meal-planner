FROM node:20-slim

WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN npx playwright install chromium --with-deps
COPY . .

RUN chmod +x entrypoint.sh
EXPOSE 3002
CMD ["./entrypoint.sh"]

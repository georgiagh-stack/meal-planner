# Uses the official Playwright image which has Chromium pre-installed.
# If you need to update Playwright, change the version tag here and in package.json.
FROM mcr.microsoft.com/playwright:v1.48.2-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

EXPOSE 3002
CMD ["node", "server.js"]

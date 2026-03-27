FROM node:20-bullseye

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

CMD ["/bin/bash", "-lc", "npx tsc --noEmit && npm test -- --ci --runInBand"]

FROM node:20-bullseye

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund --ignore-scripts

COPY . .

CMD ["/bin/bash", "-lc", "npx tsc --noEmit && npm test -- --ci --runInBand"]

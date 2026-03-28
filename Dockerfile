FROM node:20-bullseye

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
# Install with legacy peer deps to match CI and avoid ERESOLVE against Expo canaries
RUN npm ci --legacy-peer-deps --no-audit --no-fund

COPY . .

CMD ["/bin/bash", "-lc", "npx tsc --noEmit && npm test -- --ci --runInBand"]

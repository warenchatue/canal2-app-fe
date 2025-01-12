#--- BUILD DEV

FROM node:20-alpine

ENV NODE_ENV development

WORKDIR /home/dinoes

COPY . .

RUN rm -rf node_modules
RUN npm cache clean --force
RUN npm install -g pnpm
RUN pnpm install

ENV HOST 0.0.0.0
EXPOSE 3000
CMD ["pnpm","dev"]

#--- BUILD PROD 

# FROM node:20-alpine

# ENV NODE_ENV development

# WORKDIR /home/dinoes

# COPY . .

# RUN rm -rf node_modules
# RUN npm cache clean --force
# RUN npm install -g pnpm
# RUN pnpm install
# RUN node --max-old-space-size=4096 node_modules/nuxt/bin/nuxt.mjs build .app
# EXPOSE 3000
# CMD ["node", "./.app/.output/server/index.mjs"]


# # # FROM node
# # # move node_modules up in the app's directory to hide from the host mapping (to avoid conflicts with binaries of desktop versus container image) and install
# # # RUN set -ex
# # # RUN apt-get -y update
# # # RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb 
# # # RUN apt install ./google-chrome-stable_current_amd64.deb -y
# # # RUN sudo sysctl -w kernel.unprivileged_userns_clone=1

# # # WORKDIR /usr/src
# # # COPY ./package*.json ./
# # # RUN npm i --no-optional && npm cache clean --force
# # # # put the node modules' binaries on the PATH
# # # ENV PATH /usr/src/node_modules/.bin:$PATH
# # # # set the app directory
# # # WORKDIR /usr/src/app
# # # COPY . .


# # # RUN set -ex; \
# # #   apt-get -y update; \
# # #   wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb; \
# # #   apt install -y ./google-chrome-stable_current_amd64.deb ;

# # # ENV PORT=3000
# # # EXPOSE 3000

# # # CMD npm start


# # # Copyright 2020 Google LLC. All rights reserved.
# # # Use of this source code is governed by the Apache 2.0
# # # license that can be found in the LICENSE file.

# # # [START cloudrun_pubsub_dockerfile]
# # # [START run_pubsub_dockerfile]

# # # Use the official lightweight Node.js 12 image.
# # # https://hub.docker.com/_/node
# # FROM node:12-slim
# # # Install Imagemagick into the container image.
# # # For more on system packages review the system packages tutorial.
# # # https://cloud.google.com/run/docs/tutorials/system-packages#dockerfile
# # # RUN set -ex; \
# # #   apt-get -y update; \
# # #   apt-get -y install imagemagick; \
# # #   rm -rf /var/lib/apt/lists/* \
# # #   wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
# # #   apt-get -y install ./google-chrome-stable_current_amd64.deb \
# # #   sudo sysctl -w kernel.unprivileged_userns_clone=1

# # RUN set -ex
# # RUN apt-get update && apt-get upgrade -y 
# # RUN apt-get install ca-certificates \
# # fonts-liberation \
# # libappindicator3-1 \
# # libasound2 \
# # libatk-bridge2.0-0 \
# # libatk1.0-0 \
# # libc6 \
# # libcairo2 \
# # libcups2 \
# # libdbus-1-3 \
# # libexpat1 \
# # libfontconfig1 \
# # libgbm1 \
# # libgcc1 \
# # libglib2.0-0 \
# # libgtk-3-0 \
# # libnspr4 \
# # libnss3 \
# # libpango-1.0-0 \
# # libpangocairo-1.0-0 \
# # libstdc++6 \
# # libx11-6 \
# # libx11-xcb1 \
# # libxcb1 \
# # libxcomposite1 \
# # libxcursor1 \
# # libxdamage1 \
# # libxext6 \
# # libxfixes3 \
# # libxi6 \
# # libxrandr2 \
# # libxrender1 \
# # libxss1 \
# # libxtst6 \
# # lsb-release \
# # wget \
# # xdg-utils -y
# # RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb 
# # RUN apt install ./google-chrome-stable_current_amd64.deb -y


# # # Create and change to the app directory.
# # WORKDIR /usr/src/app

# # # Copy application dependency manifests to the container image.
# # # A wildcard is used to ensure both package.json AND package-lock.json are copied.
# # # Copying this separately prevents re-running npm install on every code change.
# # COPY package*.json ./

# # # Install dependencies.
# # # If you add a package-lock.json speed your build by switching to 'npm ci'.
# # RUN npm ci --only=production
# # RUN npm install --production

# # # Copy local code to the container image.
# # COPY . .
# # ENV PORT=3000
# # EXPOSE 3000

# # # Run the web service on container startup.
# # CMD [ "npm", "start" ]

# # [END run_pubsub_dockerfile]
# # [END cloudrun_pubsub_dockerfile]



# # A minimal Docker image with Node and Puppeteer
# #
# # Initially based upon:
# # https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker

# FROM node:14.16.0-buster-slim@sha256:ffc15488e56d99dbc9b90d496aaf47901c6a940c077bc542f675ae351e769a12
# RUN  apt-get update \
#      && apt-get install -y wget gnupg ca-certificates procps libxss1 \
#      && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#      && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#      && apt-get update \
#      # We install Chrome to get all the OS level dependencies, but Chrome itself
#      # is not actually used as it's packaged in the node puppeteer library.
#      # Alternatively, we could could include the entire dep list ourselves
#      # (https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix)
#      # but that seems too easy to get out of date.
#      && apt-get install -y google-chrome-stable \
#      && rm -rf /var/lib/apt/lists/* \
#      && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
#      && chmod +x /usr/sbin/wait-for-it.sh 
# RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb 
# RUN apt install ./google-chrome-stable_current_amd64.deb -y
# WORKDIR /usr/src/app
# # Install Puppeteer under /node_modules so it's available system-wide
# ADD package*.json ./
# RUN npm install
# COPY . .
# ENV PORT=3000
# EXPOSE 3000

# # Run the web service on container startup.
# CMD [ "npm", "start" ]





# First, we need to make sure all dependencies are there. If you are using docker, then the important dependencies are already present on most node images. 
# FROM node:8
FROM node:12-slim
# To run Headful mode, you will need to have a display, which is not present in a server. 
# To avoid this, we will use Xvfb, and create a fake display, so the chrome will think there is a display and run properly. 
# So we just need to install Xvfb and Puppeteer related dependencies.
RUN apt-get update && apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget x11vnc x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps xvfb

# I am going to ignore dumb-init or such for now since it will add complexities to understand what is actually needed here. 

# Assuming we are working on /app folder, cd into /app
WORKDIR /app

# Copy package.json into app folder
COPY package.json /app

# Install dependencies
RUN npm install 

COPY . /app

# Start server on port 3000
EXPOSE 3000

# I'll also assume you are going to use root user, 
# and your script has `--no-sandbox` and `--disable-setuid-sandbox` arguments.
# We run a fake display and run our script.
# Start script on Xvfb
CMD xvfb-run --server-args="-screen 0 1024x768x24" npm start
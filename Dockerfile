FROM debian:buster
RUN useradd -u 1000 -m server
RUN apt-get update && apt-get install -y curl && apt-get clean
#install node
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
	apt-get install -y nodejs
#install pnpm
RUN curl -f https://get.pnpm.io/v6.js | node - add --global pnpm
#install tools for isolated-vm
RUN apt-get install -y python g++ build-essential git

WORKDIR /home/server

COPY . codeconomy/
WORKDIR /home/server/codeconomy
#test
#COPY ./secrets/codeconomy0-firebase-adminkey.json .
RUN pnpm install --production --unsafe-perm
RUN chown -R server /home/server
USER 1000

#RUN export GOOGLE_APPLICATION_CREDENTIALS=codeconomy0-firebase-adminkey.json

#Websocket
EXPOSE 8001
#Geckos
EXPOSE 8080
EXPOSE 7000-8000/udp

ENV NODE_ENV=production
ENTRYPOINT ["npm", "run", "start:server:prod"]
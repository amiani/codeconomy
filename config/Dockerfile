FROM debian:buster
RUN useradd -u 1000 -m server
RUN apt-get update && apt-get install -y curl && apt-get clean
#install node
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
	apt-get install -y nodejs
#install pnpm
RUN curl -f https://get.pnpm.io/v6.js | node - add --global pnpm
#install tools for isolated-vm
RUN apt-get install -y python g++ build-essential

WORKDIR /home/server

COPY .. codeconomy
WORKDIR /home/server/codeconomy
RUN pnpm install --production && pnpm rebuild
RUN chown -R server /home/server
USER 1000

ENTRYPOINT ["NODE_ENV=production npm", "run", "start:server"]
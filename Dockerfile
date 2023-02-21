FROM node
RUN mkdir -p app/
WORKDIR /app
USER node
CMD ["npm", "run", "watch"]

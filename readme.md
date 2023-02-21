# Accelerator App test assignment

## Setup

- Copy `.env.dist` into `.env`
  - if necessary, edit `DATABASE_URL` value
  - /!\ WARNING: do not put quotes on your value, to avoid any Prisma error

- Be sure your node version is 14.17.X or 16.X or 18.X

```cli
node -v
```

You can use nvm to change your version.


- Launch the app (if you want the logs, remove `-d` option):

```cli
docker-compose up -d
```

- Install:
NB: incompatibility issue with prisma if this command is played outside the container

```cli
docker-compose exec apollo-graphql-server npm i
```

- Initialize the database and seed it:

```cli
docker-compose exec apollo-graphql-server npx prisma migrate dev --name init 
```

- Go on localhost:4000 to access the queries playground!

## Implementation choices, issues and work in progress

- Main difficulty: first time with GraphQL and its whole ecosystem.
  - Good practices are not well known
  - it can be hard to design an API outside the REST concept.
  
- Difficulty to understand the assignments features (for instance: "The front-end team needs an API that will return the data in total for the selected period and in increments of weeks to display the data in graphs that displays the number per week.")
  
- The queries filters are incomplete
  
- The error handling is minimal and should be improved
  
- No unit and integration tests for lack of time
  
- If this POC were to be used in production, a parser of .csv should be added to the project to automate the data import.

- For now, the `watch` command doesn't watch for any changes in .graphql files. Should find a way to include them.

- Redunduncy on the types definition: they are both in schema.graphql and schema.prisma. Should find a way to avoid the duplicate.
  
- Since GraphQL does not support a Date type, we had to build our own. It could be optimized according the Frontend needs
  
- The date format returned by the database is a timestamp. Could be updated according the Frontend need
  
- For more security, Replace the actual ID system with some UUID
  
- For now, the app architecture is very technical centred, and defined by the tools we use (for instance, Prisma). It works with a small project, but not with bigger ones. Other was, such as a DDD, should be considered.
  
- Configuration difficulty: issues while compiling .graphql files and to dockerize prisma
  
- For now, the Dockerfile is only development ready and should be updated if necessary for production environment.

To get more details, all work in progress has a "TODO" comment in the code.

## Assignment goals and specifications

"In this test, you want to see your ability to manipulate transactions like data in aggregation and reporting.

This take-home is meant to be a POC rather than a full fledge project but one that demonstrates your understanding of data storing, retrieving, and aggregation in an effective manner.

- Data

  - You have a pizza shop with 3 types of pizza:
    - Pepperoni
    - Branco
    - All dressed
  - You have sold pizza in the past year (2022), and now you need to build a graphQl API to analyze this data. [Here are the assumptions](https://docs.google.com/spreadsheets/d/1byShULmKZCmGqfLSUwh1RWWcEUPgZq3FRwYHJpV1ZXo/edit?usp=sharing
  ).

- Queries

  - You need to create a graphQL API that will return data with these filters:
    - time: (period start date, end date) or per selected calendar month
    - selected pizza(s) or all pizza

  - You should be able to query the following information through the above filters:
    - unit sold
    - ingredients used
    - Cost of ingredients
    - Sales

- The front-end team needs an API that will return the data in total for the selected period and in increments of weeks to display the data in graphs that displays the number per week.

- Technical specifications
  - You should use whichever database you want
  - use Typescript with whatever library you want.
  - The application should be Dockerized.

Once completed, paste the link of your GitHub repo (publicly open) in the form accessible by the button below.

BONUS: add an integration test on a query.



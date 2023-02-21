import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { resolvers } from './schema/resolvers/resolvers'

const prisma = new PrismaClient();

const main = async () => {

    /* The ApolloServer constructor requires two parameters: 
    *   - your schema
    *   - definition and your set of resolvers.
    * */
    const server = new ApolloServer({
        typeDefs: readFileSync(
            join(__dirname, '/schema/typeDefs/schema.graphql'),
            'utf8'
        ),
        resolvers,
    });

    // Passing an ApolloServer instance to the `startStandaloneServer` function:
    //  1. creates an Express app
    //  2. installs your ApolloServer instance as middleware
    //  3. prepares your app to handle incoming requests
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
    });

    console.log(`🚀  Server ready at: ${url}`);
}

main()
    .catch(e => { throw e })
    .finally(async () => await prisma.$disconnect());












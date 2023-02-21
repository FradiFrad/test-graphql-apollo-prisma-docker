import { PizzaName, Prisma, PrismaClient } from "@prisma/client";
import { GraphQLScalarType, Kind } from "graphql";

const prisma = new PrismaClient();

/*
*   We have to create our own Date type 
*     -> cf: https://www.apollographql.com/docs/apollo-server/schema/custom-scalars/#example-the-date-scalar
*   TODO: change the date format (from timestamp to readable string). 
*   For now, must be handled by the front
*/
const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value) {
        if (value instanceof Date) {
            return value.getTime(); // Convert outgoing Date to integer for JSON
        }
        throw Error('GraphQL Date Scalar serializer expected a `Date` object');
    },
    parseValue(value) {
        if (typeof value === 'number') {
            return new Date(value); // Convert incoming integer to Date
        }
        throw new Error('GraphQL Date Scalar parser expected a `number`');
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            // Convert hard-coded AST string to integer and then to Date
            return new Date(parseInt(ast.value, 10));
        }
        // Invalid hard-coded value (not an integer)
        return null;
    },
});

// TODO: find a way to export input type from schema.graphql
type GetPizzasQuery = {
    names: [PizzaName]
    ids: [number]
}

type GetOrdersQuery = {
    orderIds: [number]
    pizzaIds: [number]
    startingDate: Date
    endingDate: Date
}

const getPizzasQuery = (pizzasInput: GetPizzasQuery) => {
    let andWhere: Prisma.PizzaWhereInput[] = [];
    const { ids, names } = pizzasInput;

    if (ids) {
        andWhere.push({
            id: {
                in: ids.map(Number)
            },
        })
    }

    if (names) {
        andWhere.push({
            name: {
                in: names
            },
        })
    }
    return andWhere

}


const getOrdersQuery = (ordersInput: GetOrdersQuery) => {
    let andWhere: Prisma.OrderWhereInput[] = [];
    const { orderIds, pizzaIds, startingDate, endingDate } = ordersInput;
    if (orderIds) {
        andWhere.push({
            id: {
                in: orderIds.map(Number)
            },
        })
    }

    if (pizzaIds) {
        andWhere.push({
            pizzaId: {
                in: pizzaIds.map(Number)
            },
        })
    }
    if (startingDate && endingDate) {
        if (endingDate < startingDate) throw new Error("Error: endingDate is before startingDate. Please change these values.")
        andWhere.push({
            date: {
                gte: startingDate,
                lte: endingDate,
            },
        })
    }

    return andWhere

}

export const resolvers = {
    Date: dateScalar,   // Have to define a custom date type
    Query: {
        getPizzas: async (parent: any, args: any, context: any, info: any) => {
            try {
                let where

                if (args.pizzasInput === undefined) {
                    where = {}
                } else {
                    const andWhere: Prisma.PizzaWhereInput[] = getPizzasQuery(args.pizzasInput);
                    where = {
                        AND: andWhere
                    }
                }

                const res = await prisma.pizza.findMany({
                    where: where,
                    include: {
                        recipes: {
                            include: {
                                ingredient: true,
                            },
                        },
                    },
                })
                return res
            } catch (e) {
                console.error("Error in getPizzas Query: ", e, "args:", args);
            }
        },
        // TODO: add filter by name
        getPizza: async (parent: any, args: any, context: any, info: any) => {
            const { id } = args
            try {
                const res = await prisma.pizza.findUnique({
                    where: {
                        id: Number(id),
                    },
                    include: {
                        recipes: {
                            include: {
                                ingredient: true,
                            },
                        },
                    },
                })

                return res
            } catch (e) {
                console.error("Error in getOnePizza Query: ", e, "id:", id);
            }
        },
        // TODO: add filter by month name
        getOrders: async (parent: any, args: any, context: any, info: any) => {
            try {
                let where

                if (args.ordersInput === undefined) {
                    where = {}
                } else {
                    const andWhere: Prisma.OrderWhereInput[] = getOrdersQuery(args.ordersInput);
                    where = {
                        AND: andWhere
                    }
                }

                const res = await prisma.order.findMany({
                    where: where,
                    select: {
                        id: true,
                        quantity: true,
                        date: true,
                        pizza: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                recipes: {
                                    select: {
                                        ingredient: {
                                            select: {
                                                id: true,
                                                name: true,
                                                price: true,
                                                unit: true
                                            }
                                        },
                                        quantity: true
                                    }
                                }
                            }
                        }
                    },
                })

                return res
            } catch (e) {
                console.error("Error in getOrders Query: ", e);
            }
        },
        getRecipeForOnePizza: async (parent: any, args: any, context: any, info: any) => {
            try {
                const { pizzaId } = args;

                const res = await prisma.recipe.findMany({
                    where: {
                        pizzaId: Number(pizzaId)
                    },
                    include: {
                        ingredient: true,
                        pizza: {
                            select: {
                                name: true
                            }
                        },
                    },
                })

                return res
            } catch (e) {
                console.error("Error in getRecipeForOnePizza Query: ", e);
            }
        },
    },
};
import { IngredientName, PizzaName, PrismaClient, Unit } from '@prisma/client'
import ordersJSON from '../data/orders.json'
import ingredientsJSON from '../data/ingredients.json'
import pizzasJSON from '../data/pizzas.json'
import recipeIngredientsJSON from '../data/recipeIngredients.json'

const prisma = new PrismaClient();


async function main() {
    try {
        // Populate Ingredient table
        await prisma.ingredient.createMany({
            data: ingredientsJSON.map(el => ({ name: el[0] as IngredientName, price: el[1] as number, unit: el[2] as Unit }))
        })

        const createdIngredients = await prisma.ingredient.findMany();

        const findIngredientId = (ingredientName: IngredientName) => {
            const ingredient = createdIngredients.find(ingredient => ingredient.name === ingredientName)
            if (!ingredient) throw new Error("Ingredient not found with this name:" + ingredientName)
            return ingredient.id
        }

        // Populate Pizza table
        await prisma.pizza.createMany({
            data: pizzasJSON.map(el => ({ name: el[0] as PizzaName, price: el[1] as number }))
        })
        const createdPizzas = await prisma.pizza.findMany();

        const findPizzaId = (pizzaName: PizzaName) => {
            const pizza = createdPizzas.find(pizza => pizza.name === pizzaName)
            if (!pizza) throw new Error("Pizza not found with this name:" + pizzaName)
            return pizza.id
        }

        // Populate Order table
        for (const ordersOfTheDay of ordersJSON) {
            await prisma.order.createMany({
                data: [
                    {
                        date: new Date(ordersOfTheDay.Date),
                        pizzaId: findPizzaId(PizzaName.Pepperoni),
                        quantity: ordersOfTheDay.Pepperoni
                    },
                    {
                        date: new Date(ordersOfTheDay.Date),
                        pizzaId: findPizzaId(PizzaName.Branco),
                        quantity: ordersOfTheDay.Branco
                    },
                    {
                        date: new Date(ordersOfTheDay.Date),
                        pizzaId: findPizzaId(PizzaName.AllDressed),
                        quantity: ordersOfTheDay.AllDressed
                    },
                ]
            })
        }

        // Populate Recipe table
        for (const recipe of recipeIngredientsJSON) {
            for (const ingredient of recipe.ingredients) {
                await prisma.recipe.create({
                    data:
                    {
                        pizzaId: findPizzaId(recipe.name as PizzaName),
                        ingredientId: findIngredientId(ingredient[0] as IngredientName),
                        quantity: ingredient[1] as number
                    },
                })
            }
        }

        console.log('Populate complete !');

    } catch (e) {
        throw e
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => await prisma.$disconnect())
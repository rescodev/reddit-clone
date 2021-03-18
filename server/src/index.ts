import MikroConnection from "./data/mikroOrm/MikroConnection"
import express from 'express'
import env from './Env'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import PostRepository from "./resolvers/PostRepository"
import UserRepository from "./resolvers/UserRepository"
import GraphQlContext from "./resolvers/GraphQlContext"
import Argon2Adapter from "./app/Argon2Adapter"
import RedisInstaller from "./data/redis/RedisInstaller"

const main = async () => {
    const hasher = new Argon2Adapter()
    const db = new MikroConnection()
    const orm = await db.Install()
    const sessionInstaller = new RedisInstaller()

    const apollo = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostRepository, UserRepository],
            validate: false,
        }),
        context: () => new GraphQlContext(orm.em, hasher),
    })

    const app = express()
    sessionInstaller.Init(app, env.Config.SESSION_SECRET, env.Config.SESSION_DB_PASSWORD)
    apollo.applyMiddleware({ app })
    app.listen(env.Config.PORT)
    console.log("Started")
}

main().catch(e => console.error(e))
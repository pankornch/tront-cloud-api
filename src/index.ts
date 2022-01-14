import { ApolloServer } from "apollo-server-express"
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core"
import express from "express"
import http from "http"
import typeDefs from "./typeDefs"
import resolvers from "./resolvers"
import db from "./configs/db"
import api from "./generateApi"

async function startApolloServer(typeDefs: any, resolvers: any) {
	const app = express()
	app.use("/api", api)
	
	const httpServer = http.createServer(app)
	try {
		const server = new ApolloServer({
			typeDefs,
			resolvers,
			plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
			context: ({ req }) => {
				const authorization = req.headers.authorization || ""
				return { req, authorization }
			},
		})

		await db()
		await server.start()
		server.applyMiddleware({ app })
		await new Promise<void>((resolve) =>
			httpServer.listen({ port: 4000 }, resolve)
		)
		console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
	} catch (error) {
		console.error(error)
	}
}

startApolloServer(typeDefs, resolvers)

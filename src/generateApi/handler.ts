import express from "express"
import router from "./index"
import serverless from "serverless-http"
import cors from "cors"
const app = express()

app.use(cors({ origin: "*" }))
app.use("/api", router)

export const handler = serverless(app)

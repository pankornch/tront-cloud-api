import dotenv from "dotenv"
dotenv.config()

const { DATABASE_URL, DATABASE_NAME } = process.env

export { DATABASE_URL, DATABASE_NAME }

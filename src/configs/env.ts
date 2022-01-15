import dotenv from "dotenv"
dotenv.config()

const { DATABASE_URL, DATABASE_NAME, JWT_SECRET, API_URL } = process.env

export { DATABASE_URL, DATABASE_NAME, JWT_SECRET, API_URL }

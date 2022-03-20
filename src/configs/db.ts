import mongoose from "mongoose"
import { DATABASE_URL, DATABASE_NAME } from "./env"

const wait = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export default async (databaseUri?: string) => {
	let error: any

	console.log("\n Connecting database... \n")
	
	for (let i = 1; i <= 5; i++) {
		const conn = await connet(databaseUri)
		if (!conn?.error) {
			console.log("Database Connected")
			return null
		} else {
			error = conn.error
			console.log(`Try to connect database ${i}/5`)
		}
		await wait(1000)
	}

	console.error("Cannot connect database")
	throw error
}

const connet = async (databaseUri?: string) => {
	console.log("\n Connecting database... \n")
	try {
		const uri = DATABASE_URL + "/" + DATABASE_NAME
		await mongoose.connect(databaseUri || uri)
		return
	} catch (error: any) {
		return {
			error: error,
		}
	}
}

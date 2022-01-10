import mongoose from "mongoose"
import { DATABASE_URL, DATABASE_NAME } from "./env"

const wait = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export default async () => {
	let error: any

	for (let i = 1; i <= 5; i++) {
		const conn = await connet()
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

const connet = async () => {
	try {
		const uri = DATABASE_URL + "/" + DATABASE_NAME
		await mongoose.connect(uri)
		return
	} catch (error: any) {
		return {
			error: error,
		}
	}
}

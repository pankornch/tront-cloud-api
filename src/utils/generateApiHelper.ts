import ApiSchema from "@/models/ApiSchema"
import { ModelTypes, IModel, ApiNames } from "@/types"
import Joi from "joi"
import { MongoClient } from "mongodb"


const url = "mongodb://localhost:27017"
const client = new MongoClient(url)

export const apiModel = async ({ dbName, colName }: any) => {
	await client.connect()
	const db = client.db(dbName)

	const col = db.collection(colName)
	return col
}

export const mapToJoi = (type: ModelTypes, required: boolean) => {
	let joi: any = Joi
	switch (type) {
		case "STRING":
			joi = joi.string()
			break
		case "NUMBER":
			joi = joi.number()
			break
		default:
			joi = joi.string()
	}

	if (required) joi = joi.required()
	return joi
}

interface ValidateApiMetodProps {
	model: IModel
	params: Record<string, any>
	methodName: ApiNames
}

export const validateApiMethod = async ({
	model,
	params,
	methodName,
}: ValidateApiMetodProps) => {
	const apiSchema = await ApiSchema.findOne({
		model: model._id,
	}).lean()

	if (!apiSchema) {
		return {
			status: false,
			code: 404,
			message: `${params.modelName} not found`,
		}
	}

	const method = apiSchema.methods.find((e) => e.name === methodName)!

	if (!method.active) {
		return {
			status: false,
			code: 403,
			message: "",
		}
	}

	return {
		status: true,
	}
}

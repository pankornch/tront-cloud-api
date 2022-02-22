import ApiSchema from "@/models/ApiSchema"
import App from "@/models/App"
import Model from "@/models/Model"
import { ModelTypes, IModel, ApiNames, IApp } from "@/types"
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
	methodName: ApiNames
}

export const validateApiMethod = async ({
	model,
	methodName,
}: ValidateApiMetodProps) => {
	const apiSchema = await ApiSchema.findOne({
		model: model._id,
	}).lean()

	if (!apiSchema) {
		return {
			status: false,
			code: 404,
			message: `${model.name} not found`,
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

interface ValidateApp {
	appSlug: string
	modelName: String
	methodName: ApiNames
}

interface ValidateAppResult {
	status: boolean
	code?: number
	message?: string
	app?: IApp
	model?: IModel
}

export const validateApp = async ({
	appSlug,
	modelName,
	methodName,
}: ValidateApp): Promise<ValidateAppResult> => {
	const app = await App.findOne({
		slug: appSlug,
	})
	if (!app) {
		return {
			status: false,
			code: 404,
			message: `${appSlug} not found`,
		}
	}

	const model = await Model.findOne({
		$and: [
			{
				app: app._id,
			},
			{
				name: modelName,
			},
		],
	}).lean()

	if (!model) {
		return {
			status: false,
			code: 404,
			message: `${modelName} not found!`,
		}
	}

	const result = await validateApiMethod({
		model,
		methodName,
	})

	if (!result.status) {
		return result
	}

	return {
		status: true,
		app,
		model,
	}
}

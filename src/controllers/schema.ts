import ApiSchema from "@/models/ApiSchema"
import App from "@/models/App"
import Model from "@/models/Model"
import { IApiSchema, ID, IModel, Resolver } from "@/types"
import { UserInputError } from "apollo-server-core"

interface CreateSchemaInput {
	input: {
		model: IModel
		apiSchema: IApiSchema
		appId: ID
	}
}
export const createSchema: Resolver<any, CreateSchemaInput> = async (
	_,
	{ input },
	{ user }
) => {
	const app = await App.findOne({
		$and: [{ user: user!._id }, { _id: input.appId }],
	})

	if (!app) {
		throw new UserInputError("Incorrect app id")
	}

	const model = new Model({
		...input.model,
		app: input.appId,
	})

	const apiSchema = new ApiSchema({
		...input.apiSchema,
		model: model._id,
		app: input.appId,
	})

	await Promise.all([model.save(), apiSchema.save()])

	return {
		model,
		apiSchema,
	}
}

interface UpdateSchemaInput {
	input: {
		model: IModel
		apiSchema: IApiSchema
		appId: ID
	}
}
export const updateSchema: Resolver<any, UpdateSchemaInput> = async (
	_,
	{ input },
	{ user }
) => {
	const app = await App.findOne({
		$and: [{ user: user!._id }, { _id: input.appId }],
	})
	if (!app) {
		throw new UserInputError("Incorrect app id")
	}

	const [model, apiSchema] = await Promise.all([
		Model.findOneAndUpdate(
			{
				$and: [
					{
						_id: input.model._id,
					},
					{
						app: input.appId,
					},
				],
			},
			{ $set: input.model },
			{ new: true }
		),
		ApiSchema.findOneAndUpdate(
			{
				$and: [
					{ model: input.model._id },
					{
						app: input.appId,
					},
				],
			},
			{
				$set: input.apiSchema,
			},
			{ new: true }
		),
	])

	return {
		model,
		apiSchema,
	}
}

interface DeleteSchemaInput {
	input: {
		modelId: ID
		appId: ID
	}
}
export const deleteSchema: Resolver<any, DeleteSchemaInput> = async (
	_,
	{ input },
	{ user }
) => {
	const app = await App.findOne({
		$and: [{ user: user!._id }, { _id: input.appId }],
	})
	if (!app) {
		throw new UserInputError("Incorrect app id")
	}

	await Promise.all([
		Model.deleteOne({
			$and: [{ _id: input.modelId }, { app: input.appId }],
		}),
		ApiSchema.deleteOne({
			$and: [{ model: input.modelId }, { app: input.appId }],
		}),
	])

	return "Delete successful!"
}

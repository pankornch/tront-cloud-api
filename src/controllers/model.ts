import client from "@/configs/mongoGenApi"
import Model from "@/models/Model"
import { IApiSchema, IModel, Resolver } from "@/types"
import { apiNamespace } from "@/utils/apiNamespace"
import { UserInputError } from "apollo-server-core"

interface UpdateModelInput extends IModel {}
export const updateModel: Resolver<any, { input: UpdateModelInput }> = async (
	_,
	{ input },
	{ user }
) => {
	// const model = await Model.findById(input._id).lean()
	// if (!model) {
	// 	throw new UserInputError("Incorrect model id")
	// }

	const result = await Model.updateOne(
		{
			$and: [
				{
					_id: input._id,
				},
				{
					user: user!._id,
				},
			],
		},
		{
			$set: {
				name: input.name,
				fields: input.fields,
			},
		}
	)

	if (!result.matchedCount) {
		throw new UserInputError("Incorrect model id")
	}

	// await client.connect()
	// const db = client.db(apiNamespace.dbName(user!._id.toString()))
	// const col = db.collection(
	// 	apiNamespace.colName(model.app.toString(), model._id.toString())
	// )

	// const fields: Record<string, string> = {}

	// model.fields.forEach(e => {
	//     fields
	// })

	// col.updateMany({}, { $rename: {} })

	return await Model.findById(input._id).lean()
}

interface CreateModelInput {
	model: IModel
	apiSchema: IApiSchema
}
export const createModel: Resolver<any, { input: CreateModelInput }> = (
	_,
	{ input },
	{ user }
) => {}

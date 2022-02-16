import ApiSchema from "@/models/ApiSchema"
import Model from "@/models/Model"
import { IApiMethod, Resolver } from "@/types"
import { UserInputError } from "apollo-server-core"

interface UpdateApiMethodInput {
	modelId: string
	methods: IApiMethod[]
}
export const updateApiSchema: Resolver<
	any,
	{ input: UpdateApiMethodInput }
> = async (_, { input }, { user }) => {
	const model = await Model.findOne({
		$and: [{ _id: input.modelId }, { user: user!._id }],
	})

	if (!model) {
		throw new UserInputError("Incorrect model id")
	}

	await ApiSchema.updateOne(
		{
			model: input.modelId,
		},
		{
			$set: {
				methods: input.methods,
			},
		}
	)

	return await ApiSchema.findOne({ model: input.modelId }).lean()
}
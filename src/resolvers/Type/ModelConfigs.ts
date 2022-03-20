import {
	ResolverType,
	IApp,
} from "../../types"
import { Model } from "../../models"

export const ModelConfigsResolver: ResolverType<IApp> = {
	models: async (parent) => {
		const models = await Model.find({ app: parent._id }).lean()
		return models
	},
}
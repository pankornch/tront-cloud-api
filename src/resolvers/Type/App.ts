import { IApiConfigs, IApiSchema, IApp, Resolver, ResolverType } from "@/types"
import Model from "@/models/Model"
import ApiType from "@/models/ApiType"
import ApiSchema from "@/models/ApiSchema"

export const AppResolver: ResolverType<IApp> = {
	modelConfigs: async (parent) => {
		const models = await Model.find({
			app: parent._id,
		})
		return { models }
	},
	apiConfigs: async (parent) => {
		return parent
	},
}

export const ApiConfigsResolver: ResolverType<IApp> = {
	apiTypes: async (parent) => {
		const apiTypes = await ApiType.find({ app: parent._id }).lean()
		return apiTypes
	},
	apiSchemas: async (parent) => {
		const apiSchemas = await ApiSchema.find({ app: parent._id }).lean()

		return apiSchemas
	},
}

export const ApiSchemaResolver: ResolverType<IApiSchema> = {
	model: async (parent) => {
		const model = await Model.findById(parent.model).lean()
		return model
	},
}

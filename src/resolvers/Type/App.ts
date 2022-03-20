import { IApiSchema, IApp, ResolverType } from "../../types"
import Model from "../../models/Model"
import ApiType from "../../models/ApiType"
import ApiSchema from "../../models/ApiSchema"
import { API_URL } from "../../configs/env"
import { Member, User } from "../../models"

export const AppResolver: ResolverType<IApp> = {
	modelConfigs: async (parent) => {
		return parent
	},
	apiConfigs: async (parent) => {
		return parent
	},
	user: async (parent) => {
		const user = await User.findById(parent.user).lean()
		return user
	},
	members: async (parent) => {
		const members = await Member.find({ app: parent._id }).lean()
		return members
	},
}

export const ApiConfigsResolver: ResolverType<IApp> = {
	apiTypes: async (parent) => {
		const apiTypes = await ApiType.find({ app: parent._id }).lean()
		return apiTypes.map((e) => ({
			...e,
			url: `${API_URL}${e.url}`,
		}))
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

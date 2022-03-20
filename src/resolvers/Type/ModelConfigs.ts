import {
	ResolverType,
	IModelConfigs,
	IApp,
	IModelRelationship,
} from "../../types"
import { Model, ModelRelationship } from "../../models"

export const ModelConfigsResolver: ResolverType<IApp> = {
	modelRelationships: async (parent) => {
		const relationships = await ModelRelationship.find({
			app: parent._id,
		}).lean()
		return relationships
	},
	models: async (parent) => {
		const models = await Model.find({ app: parent._id }).lean()
		return models
	},
}

export const ModelRelationshipResolver: ResolverType<IModelRelationship> = {
	localModel: async (parent) => {
		const model = await Model.findById(parent.localModel).lean()
		return model
	},
	targetModel: async (parent) => {
		const model = await Model.findById(parent.targetModel).lean()
		return model
	},
}

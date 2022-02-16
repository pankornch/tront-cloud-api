import ApiSchema from "@/models/ApiSchema"
import Model from "@/models/Model"
import { ApiNames, IApiMethod, IApiSchema, IApp, IModel } from "@/types"

export const handleCreateModels = (models: IModel[], app: IApp) => {
	let $models = []
	for (const model of models) {
		const $model = new Model({
			app: app._id,
			name: model.name,
			fields: model.fields,
		})

		$models.push($model)
	}

	return $models
}

interface handleCreateApiProps {
	model: IModel
	apiSchemas: IApiSchema[] | undefined
}

interface CreateApiMethodProps {
	modelName: string
}

export const createApiMethod = ({ modelName }: CreateApiMethodProps) => {
	const methodNames: ApiNames[] = [
		"GET_ALL",
		"GET_ONE",
		"POST",
		"PATCH",
		"PUT",
		"DELETE",
	]

	return {
		new() {
			return [
				{
					name: "GET_ALL",
					pathname: `/${modelName}`,
					active: false,
					public: false,
				},
				{
					name: "GET_ONE",
					pathname: `/${modelName}/:_id`,
					active: false,
					public: false,
				},
				{
					name: "POST",
					pathname: `/${modelName}/:_id`,
					active: false,
					public: false,
				},
				{
					name: "PATCH",
					pathname: `/${modelName}/:_id`,
					active: false,
					public: false,
				},
				{
					name: "PUT",
					pathname: `/${modelName}/:_id`,
					active: false,
					public: false,
				},
				{
					name: "DELETE",
					pathname: `/${modelName}/:_id`,
					active: false,
					public: true,
				},
			]
		},
		validate(methods: IApiMethod[]) {
			if (methods.length !== methodNames.length) {
				return {
					isError: true,
					message: "Invalid methods length",
				}
			}

			if (!methods.every((e) => methodNames.includes(e.name))) {
				return {
					isError: true,
					message: "Invalid methods name",
				}
			}

			return {
				isError: false,
			}
		},
	}
}

// 1. Create Api with Empty data
// 2. Create Api with Exist data

export const handleCreateApi = ({ model, apiSchemas }: handleCreateApiProps) => {
	if (!apiSchemas?.length) {
		return new ApiSchema({
			app: model.app,
			model: model._id,
			methods: createApiMethod({ modelName: model.name }).new(),
		})
	}

	const api = apiSchemas.find((e) => (e.model as IModel).name === model.name)

	if (!api?.methods) {
		return new ApiSchema({
			app: model.app,
			model: model._id,
			methods: createApiMethod({ modelName: model.name }).new(),
		})
	}

	const isValid = createApiMethod({ modelName: model.name }).validate(
		api.methods
	)

	if (isValid.isError) {
		throw new Error(isValid.message)
	}

	return new ApiSchema({
		app: model.app,
		model: model._id,
		methods: api.methods,
	})
}
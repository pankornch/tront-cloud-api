import ApiSchema from "@/models/ApiSchema"
import ApiType from "@/models/ApiType"
import App from "@/models/App"
import Model from "@/models/Model"
import {
	ApiNames,
	IApiMethod,
	IApiSchema,
	IApp,
	IModel,
	Resolver,
} from "@/types"
import { ForbiddenError, UserInputError } from "apollo-server-core"

interface CreateAppInput extends IApp {}

const handleCreateModels = (models: IModel[], app: IApp) => {
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

const createApiMethod = ({ modelName }: CreateApiMethodProps) => {
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

const handleCreateApi = ({ model, apiSchemas }: handleCreateApiProps) => {
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

export const createApp: Resolver<null, { input: CreateAppInput }> = async (
	parent,
	{ input },
	{ user }
) => {
	const app = new App({
		name: input.name,
		slug: input.slug,
		description: input.description,
		user: user!._id,
	})

	const $models = handleCreateModels(input.modelConfigs.models, app)
	const $apis = []

	try {
		for (const $model of $models) {
			$apis.push(
				handleCreateApi({
					model: $model,
					apiSchemas: input.apiConfigs.apiSchemas,
				})
			)
		}
	} catch (error: any) {
		throw new UserInputError(error.message)
	}

	const apiType = new ApiType({
		app: app._id,
		type: "REST",
		url: `/api/rest/${app.slug}`,
	})

	await Promise.all([
		app.save(),
		Model.insertMany($models),
		ApiSchema.insertMany($apis),
		apiType.save(),
	])

	return app
}

export const getApps: Resolver = async (parent, arg, { user }) => {
	const apps = await App.find({
		user: user!._id,
	})

	return apps
}

export const getAppBySlug: Resolver = async (_, { slug }, { user }) => {
	const app = await App.findOne({
		$and: [
			{
				slug: slug,
			},
			{
				user: user!._id,
			},
		],
	})

	if (!app) {
		throw new ForbiddenError("Incorrect app")
	}

	return app
}

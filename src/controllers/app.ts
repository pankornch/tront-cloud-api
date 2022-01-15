import ApiSchema from "@/models/ApiSchema"
import ApiType from "@/models/ApiType"
import App from "@/models/App"
import Model from "@/models/Model"
import { IApiConfigs, IApp, IField, Resolver } from "@/types"

interface CreateAppInput extends IApp {}
export const createApp: Resolver<null, { input: CreateAppInput }> = async (
	parent,
	{ input },
	{ user }
) => {
	const app = new App({
		name: input.name,
		slug: input.slug,
		user: user!._id,
	})

	const models: any[] = []
	const apiSchemas: any = []

	const apiType = new ApiType({
		app: app._id,
		type: "REST",
		url: `/api/rest/${app.slug}`,
	})

	for (const model of input.modelConfigs.models) {
		let fields: any[] = []
		const $model = new Model({
			app: app._id,
			name: model.name,
		})
		for (const field of model.fields) {
			const $field = {
				model: $model._id,
				name: (field as IField).name,
				type: (field as IField).type,
				required: (field as IField).required,
				defaultValue: (field as IField).defaultValue,
			}
			fields.push($field)
		}
		$model.fields = fields
		apiSchemas.push({
			app: app._id,
			model: $model._id,
			methods: [
				{
					name: "GET_ALL",
					pathname: `/${model.name}`,
					active: false,
					public: false,
				},
				{
					name: "GET_ONE",
					pathname: `/${model.name}/:id`,
					active: false,
					public: false,
				},
				{
					name: "POST",
					pathname: `/${model.name}`,
					active: false,
					public: false,
				},
				{
					name: "PATCH",
					pathname: `/${model.name}/:id`,
					active: false,
					public: false,
				},
				{
					name: "PUT",
					pathname: `/${model.name}/:id`,
					active: false,
					public: false,
				},
				{
					name: "DELETE",
					pathname: `/${model.name}/:id`,
					active: false,
					public: false,
				},
			],
		})
		models.push($model)
	}

	await Promise.all([
		app.save(),
		Model.insertMany(models),
		apiType.save(),
		ApiSchema.insertMany(apiSchemas),
	])

	return app
}

export const getApps: Resolver = async (parent, arg, { user }) => {
	const apps = await App.find({
		user: user!._id,
	})

	return apps
}

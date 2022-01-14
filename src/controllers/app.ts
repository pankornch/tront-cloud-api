import App from "@/models/App"
import Field from "@/models/Field"
import Model from "@/models/Model"
import { IApp, IField, Resolver } from "@/types"

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

	let models: any[] = []
	let fields: any[] = []

	for (const model of input.modelConfigs.models) {
		const $model = new Model({
			app: app._id,
			name: model.name,
		})
		for (const field of model.fields) {
			const $field = new Field({
				model: $model._id,
				name: (field as IField).name,
				type: (field as IField).type,
				required: (field as IField).required,
				defaultValue: (field as IField).defaultValue,
			})
			fields.push($field)
		}
		models.push($model)
	}

	Promise.all([
		await app.save(),
		Model.insertMany(models),
		Field.insertMany(fields),
	])

	return app
}

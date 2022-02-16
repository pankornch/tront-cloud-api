import ApiSchema from "@/models/ApiSchema"
import ApiType from "@/models/ApiType"
import App from "@/models/App"
import Model from "@/models/Model"
import { IApp, Resolver } from "@/types"
import { handleCreateApi, handleCreateModels } from "@/utils/apiSchemaHelper"
import { ForbiddenError, UserInputError } from "apollo-server-core"

interface CreateAppInput extends IApp {}
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
		.sort({ createdAt: -1 })
		.lean()

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

interface UpdateAppInput {
	_id: string
	name?: string
	slug?: string
	description?: string
}
export const updateApp: Resolver<any, { input: UpdateAppInput }> = async (
	_,
	{ input },
	{ user }
) => {
	const app = await App.updateOne(
		{
			$and: [
				{
					user: user!._id,
				},
				{
					_id: input._id,
				},
			],
		},
		{
			$set: input,
		}
	)

	if (!app.matchedCount) {
		throw new UserInputError("Incorrect app id")
	}

	return await App.findById(input._id).lean()
}

interface DeleteAppInput {
	_id: string
}
export const deleteApp: Resolver<any, { input: DeleteAppInput }> = async (
	_,
	{ input },
	{ user }
) => {
	const app = await App.deleteOne({
		$and: [{ _id: input._id }, { user: user!._id }],
	})

	if (!app.deletedCount) {
		throw new UserInputError("Incorrect app id")
	}

	Promise.all([
		Model.deleteOne({ app: input._id }),
		ApiSchema.deleteOne({ app: input._id }),
		ApiType.deleteMany({ app: input._id }),
	])

	return "Delete Successful"
}

import { ApiSchema, App, ApiType, Member, Model } from "../models"
import { IApp, Resolver } from "../types"
import { handleCreateApi, handleCreateModels } from "../utils/apiSchemaHelper"
import { ForbiddenError, UserInputError } from "apollo-server-core"
import { ObjectId } from "mongodb"

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

	// const $models = handleCreateModels(input.modelConfigs.models, app)
	// const $apis = []

	// try {
	// 	for (const $model of $models) {
	// 		$apis.push(
	// 			handleCreateApi({
	// 				model: $model,
	// 				apiSchemas: input.apiConfigs.apiSchemas,
	// 			})
	// 		)
	// 	}
	// } catch (error: any) {
	// 	throw new UserInputError(error.message)
	// }

	const apiType = new ApiType({
		app: app._id,
		type: "REST",
		url: `/api/rest/${app.slug}`,
	})

	const member = new Member({
		app: app._id,
		user: user?._id,
		role: "OWNER",
		status: true,
	})

	await Promise.all([
		app.save(),
		member.save(),
		// Model.insertMany($models),
		// ApiSchema.insertMany($apis),
		apiType.save(),
	])

	return app
}

export const getApps: Resolver = async (parent, arg, { user }) => {
	// const apps = await App.find({
	// 	user: user!._id,
	// })
	// 	.sort({ createdAt: -1 })
	// 	.lean()

	const apps = await App.aggregate([
		{
			$lookup: {
				from: "members",
				localField: "_id",
				foreignField: "app",
				as: "members",
			},
		},
		{
			$match: {
				members: {
					$elemMatch: {
						$and: [
							{
								user: new ObjectId(user?._id),
							},
							{
								status: true,
							},
						],
					},
				},
			},
		},
		{
			$sort: {
				createdAt: -1,
			},
		},
	])

	return apps
}

export const getAppBySlug: Resolver = async (_, { slug }, { user }) => {
	// const app = await App.findOne({
	// 	$and: [
	// 		{
	// 			slug: slug,
	// 		},
	// 		{
	// 			user: user!._id,
	// 		},
	// 	],
	// })
	const [app] = await App.aggregate([
		{
			$match: {
				slug: slug,
			},
		},
		{
			$lookup: {
				from: "members",
				localField: "_id",
				foreignField: "app",
				as: "members",
			},
		},
		{
			$match: {
				members: {
					$elemMatch: {
						$and: [
							{
								user: new ObjectId(user?._id),
							},
							{
								status: true,
							},
						],
					},
				},
			},
		},
	])

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

export const getAppInvite: Resolver = async (_, __, { user }) => {
	const apps = await App.aggregate([
		{
			$lookup: {
				from: "members",
				localField: "_id",
				foreignField: "app",
				as: "members",
			},
		},
		{
			$match: {
				members: {
					$elemMatch: {
						$and: [
							{
								user: new ObjectId(user?._id),
							},
							{
								status: false,
							},
						],
					},
				},
			},
		},
		{
			$sort: {
				createdAt: -1,
			},
		},
	])

	return apps
}

interface ActionInviteInput {
	input: {
		appId: string
		status: boolean
	}
}
export const actionInvite: Resolver<null, ActionInviteInput> = async (
	_,
	{ input },
	{ user }
) => {
	const member = await Member.findOne(
		{
			$and: [
				{
					user: user?._id,
				},
				{
					app: input.appId,
				},
			],
		},
		
	)

	if (!member) {
		throw new UserInputError("Incorrect app id")
	}

	if (!input.status) {
		await member.delete()
	} else {
		member.status = true
	}

	const [app, __] = await Promise.all([
		App.findById(input.appId).lean(),
		member.save()
	])

	return app
}

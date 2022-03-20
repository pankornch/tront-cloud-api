import {
	IApiSchema,
	ID,
	IModel,
	Resolver,
	IApp,
} from "../types"
import { UserInputError } from "apollo-server-core"
import { ObjectId } from "mongodb"
import { ApiSchema, App, Model } from "../models"

interface CreateSchemaInput {
	input: {
		model: IModel
		apiSchema: IApiSchema
		appId: ID
	}
}
export const createSchema: Resolver<any, CreateSchemaInput> = async (
	_,
	{ input },
	{ user }
) => {
	const [app] = await App.aggregate([
		{
			$match: {
				_id: new ObjectId(input.appId),
			},
		},
		{
			$lookup: {
				from: "members",
				let: { app_id: "$_id" },
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{ $eq: ["$app", "$$app_id"] },
									{ $eq: ["$user", new ObjectId(user?._id)] },
								],
							},
						},
					},
				],
				as: "member",
			},
		},
		{
			$unwind: {
				path: "$member",
			},
		},
	])

	if (!app) {
		throw new UserInputError("Incorrect app id")
	}

	input.model.fields = input.model.fields
		.map((e) => ({ ...e, name: e.name.trim() }))
		.filter((e) => !!e.name)

	const model = new Model({
		...input.model,
		app: input.appId,
	})

	const apiSchema = new ApiSchema({
		...input.apiSchema,
		model: model._id,
		app: input.appId,
	}) 


	await Promise.all([
		model.save(),
		apiSchema.save(),
	])

	return {
		model,
		apiSchema,
	}
}

interface UpdateSchemaInput {
	input: {
		model: IModel
		apiSchema: IApiSchema
		appId: ID
	}
}
export const updateSchema: Resolver<any, UpdateSchemaInput> = async (
	_,
	{ input },
	{ user }
) => {
	const [app]: IApp[] = await App.aggregate([
		{
			$match: {
				_id: new ObjectId(input.appId),
			},
		},
		{
			$lookup: {
				from: "members",
				let: { app_id: "$_id" },
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{ $eq: ["$app", "$$app_id"] },
									{ $eq: ["$user", new ObjectId(user?._id)] },
								],
							},
						},
					},
				],
				as: "member",
			},
		},
		{
			$unwind: {
				path: "$member",
			},
		},
	])
	if (!app) {
		throw new UserInputError("Incorrect app id")
	}

	const [model, apiSchema] = await Promise.all([
		Model.findOneAndUpdate(
			{
				$and: [
					{
						_id: input.model._id,
					},
					{
						app: input.appId,
					},
				],
			},
			{ $set: input.model },
			{ new: true }
		),
		ApiSchema.findOneAndUpdate(
			{
				$and: [
					{ model: input.model._id },
					{
						app: input.appId,
					},
				],
			},
			{
				$set: input.apiSchema,
			},
			{ new: true }
		),
	])

	return {
		model,
		apiSchema,
	}
}

interface DeleteSchemaInput {
	input: {
		modelId: ID
		appId: ID
	}
}
export const deleteSchema: Resolver<any, DeleteSchemaInput> = async (
	_,
	{ input },
	{ user }
) => {
	const [app] = await App.aggregate([
		{
			$match: {
				_id: new ObjectId(input.appId),
			},
		},
		{
			$lookup: {
				from: "members",
				let: { app_id: "$_id" },
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{ $eq: ["$app", "$$app_id"] },
									{ $eq: ["$user", new ObjectId(user?._id)] },
								],
							},
						},
					},
				],
				as: "member",
			},
		},
		{
			$unwind: {
				path: "$member",
			},
		},
	])
	if (!app) {
		throw new UserInputError("Incorrect app id")
	}

	await Promise.all([
		Model.deleteOne({
			$and: [{ _id: input.modelId }, { app: input.appId }],
		}),
		ApiSchema.deleteOne({
			$and: [{ model: input.modelId }, { app: input.appId }],
		}),
	])

	return "Delete successful!"
}

import {
	IApiSchema,
	ID,
	IModel,
	IModelRelationship,
	Resolver,
	IApp,
} from "../types"
import { UserInputError } from "apollo-server-core"
import { ObjectId } from "mongodb"
import { ApiSchema, App, Model, ModelRelationship } from "../models"

interface CreateSchemaInput {
	input: {
		model: IModel
		modelRelationships: IModelRelationship[]
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

	const relationships = input.modelRelationships.map((r) => {
		return new ModelRelationship({
			app: app,
			localModel: model,
			localField: r.localField,
			targetModel: r.targetModel,
			targetField: r.targetField,
			alias: r.alias || r.localField,
		})
	})

	await Promise.all([
		model.save(),
		apiSchema.save(),
		ModelRelationship.insertMany(relationships),
	])

	return {
		model,
		apiSchema,
	}
}

interface UpdateSchemaInput {
	input: {
		model: IModel
		modelRelationships: IModelRelationship[]
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

	const relationships = await ModelRelationship.find({
		$and: [{ app: app._id }, { localModel: input.model._id }],
	}).lean()

	const mapDB: Record<string, IModelRelationship> = {}
	const mapInput: Record<string, IModelRelationship> = {}

	relationships.forEach((e) => {
		mapDB[e.localField] = e
	})

	input.modelRelationships.forEach((e) => {
		mapInput[e.localField] = e
	})

	const intersect: IModelRelationship[] = []
	const diff: IModelRelationship[] = []
	const newItems: IModelRelationship[] = []
	const deleteItems: string[] = []

	input.modelRelationships.forEach((e) => {
		if (mapDB[e.localField]) {
			intersect.push({
				...mapDB[e.localField],
				...mapInput[e.localField],
			})
		} else {
			diff.push(e)
		}
	})

	relationships.forEach((e) => {
		if (mapDB[e.localField] && !mapInput[e.localField]) {
			diff.push(e)
		}
	})

	diff.forEach((e) => {
		if (mapDB[e.localField]) {
			deleteItems.push(e._id.toString())
		} else {
			newItems.push(
				new ModelRelationship({
					...e,
					_id: undefined,
					localModel: input.model._id,
					app: app._id,
				})
			)
		}
	})

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
		ModelRelationship.bulkWrite(
			intersect.map((e) => ({
				updateOne: {
					filter: {
						_id: e._id,
					},
					update: { $set: e },
					upsert: true,
				},
			}))
		),
		ModelRelationship.insertMany(newItems),
		deleteItems.length &&
			ModelRelationship.deleteMany({
				_id: {
					$in: deleteItems,
				},
			}),
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
		ModelRelationship.deleteMany({
			$or: [{ localModel: input.modelId }, { targetModel: input.modelId }],
		}),
	])

	return "Delete successful!"
}

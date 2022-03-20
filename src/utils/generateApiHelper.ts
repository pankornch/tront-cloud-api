import ApiSchema from "../models/ApiSchema"
import {
	ModelTypes,
	IModel,
	ApiNames,
	IApp,
	IModelRelationship,
} from "../types"
import Joi from "joi"
import { Collection, MongoClient, Document } from "mongodb"
import { API_DATABASE_URL } from "../configs/env"
import db from "../configs/db"
import { ModelRelationship, App, Model } from "../models"
import { clamp } from "./helpers"
import { apiNamespace } from "./apiNamespace"

const client = new MongoClient(API_DATABASE_URL!)

export const apiModel = async ({ dbName, colName }: any) => {
	await client.connect()
	const db = client.db(dbName)

	const col = db.collection(colName)
	return col
}

export const mapToJoi = (type: ModelTypes, required: boolean) => {
	let joi: any = Joi
	switch (type) {
		case "STRING":
			joi = joi.string()
			break
		case "NUMBER":
			joi = joi.number()
			break
		default:
			joi = joi.string()
	}

	if (required) joi = joi.required()
	return joi
}

interface ValidateApiMetodProps {
	model: IModel
	methodName: ApiNames
}

export const validateApiMethod = async ({
	model,
	methodName,
}: ValidateApiMetodProps) => {
	await db()

	const apiSchema = await ApiSchema.findOne({
		model: model._id,
	}).lean()

	if (!apiSchema) {
		return {
			status: false,
			code: 404,
			message: `${model.name} not found`,
		}
	}

	const method = apiSchema.methods.find((e) => e.name === methodName)!

	if (!method.active) {
		return {
			status: false,
			code: 403,
			message: "method not allow",
		}
	}

	return {
		status: true,
	}
}

interface ValidateApp {
	appSlug: string
	modelName: String
	methodName: ApiNames
}

interface ValidateAppResult {
	status: boolean
	code?: number
	message?: string
	app?: IApp
	model?: IModel
}

export const validateApp = async ({
	appSlug,
	modelName,
	methodName,
}: ValidateApp): Promise<ValidateAppResult> => {
	await db()

	const app = await App.findOne({
		slug: appSlug,
	})
	if (!app) {
		return {
			status: false,
			code: 404,
			message: `${appSlug} not found`,
		}
	}

	const model = await Model.findOne({
		$and: [
			{
				app: app._id,
			},
			{
				name: modelName,
			},
		],
	}).lean()

	if (!model) {
		return {
			status: false,
			code: 404,
			message: `${modelName} not found!`,
		}
	}

	const result = await validateApiMethod({
		model,
		methodName,
	})

	if (!result.status) {
		return result
	}

	return {
		status: true,
		app,
		model,
	}
}

const isEmpty = (data: any) => {
	if (data === undefined || data === null) return true
	if (Array.isArray(data) && !data.length) return true
	if (typeof data === "object" && !Object.keys(data).length) return true
	return false
}

export const aggregate = (
	col: Collection<Document>,
	options: Record<string, any>
) => {
	return new Promise(async (resolve, reject) => {
		const result: any[] = []
		const pipeline: any[] = []

		for (const [k, v] of Object.entries(options)) {
			if (isEmpty(v)) continue
			if (k === "$lookup" || k === "$unwind") {
				v?.forEach((e: any) => pipeline.push(e))
			} else {
				pipeline.push({ [k]: v })
			}
		}

		console.log(JSON.stringify({ options }, null, 2))
		console.log(JSON.stringify({ pipeline }, null, 2))

		const cur = col.aggregate(pipeline)
		for await (const doc of cur) {
			result.push(doc)
		}

		resolve(result)
	})
}

export const mapToPopulate = ({
	population,
	pipeline = [],
	isNested = false,
	modelRelationships,
	currentModelId,
	appId,
}: any): any => {
	for (const p of population) {
		if (p.path) {
			console.log({ currentModelId, path: p.path })

			if (isNested) {
				const last = pipeline.reverse().find((e: any) => e["$lookup"])[
					"$lookup"
				]
				const relation = modelRelationships.find(
					(r: any) =>
						r.localModel.toString() === currentModelId && p.path == r.alias
				)
				pipeline.push({
					$lookup: {
						from: apiNamespace.colName(appId, relation.targetModel),
						localField: `${last.as}.${relation.localField}`,
						foreignField: relation.targetField,
						as: `${last.as}.${relation.alias}`,
					},
				})
				if (!relation.hasMany) {
					pipeline.push({
						$unwind: {
							path: `$${last.as}.${relation.alias}`,
						},
					})
				}
			} else {
				const relation = modelRelationships.find(
					(r: any) =>
						r.localModel.toString() === currentModelId && r.alias === p.path
				)
				if (!relation) return pipeline
				pipeline.push({
					$lookup: {
						from: apiNamespace.colName(appId, relation.targetModel),
						localField: relation.localField,
						foreignField: relation.targetField,
						as: relation.alias,
					},
				})
				if (!relation.hasMany) {
					pipeline.push({
						$unwind: {
							path: `$${relation.alias}`,
						},
					})
				}
			}
		}
		if (p.populate) {
			console.log({ currentModelId, path: p.path })
			const relation = modelRelationships.find(
				(r: any) =>
					r.localModel.toString() === currentModelId && r.alias === p.path
			)
			console.log("---", { relation })
			if (!relation) return pipeline
			return mapToPopulate({
				population: [p.populate],
				pipeline,
				modelRelationships,
				currentModelId: relation.targetModel.toString(),
				appId,
				isNested: true,
			})
		}
	}
	const $lookups = []
	const $unwind = []
	for (const pipe of pipeline) {
		if (pipe["$lookup"]) $lookups.push(pipe)
		else $unwind.push(pipe)
	}

	return [...$lookups, ...$unwind]
}

export const populate = async ({
	population,
	app,
	model,
	$filter,
	limit,
	skip,
	col,
	sort,
	projection,
}: any) => {


	const modelRelationships = await ModelRelationship.find({
		app: app._id,
	}).lean()

	const pipeline = mapToPopulate({
		appId: app._id,
		population,
		pipeline: [],
		modelRelationships,
		currentModelId: model._id.toString(),
	})
	const data = await aggregate(col, {
		$filter,
		$lookup: pipeline.filter((e: any) => e["$lookup"]),
		$unwind: pipeline.filter((e: any) => e["$unwind"]),
		limit,
		skip,
		sort,
		projection,
	})

	return data
}

export const populatePaths = async ({ population, app, model }: any) => {
	let modelRelationship: IModelRelationship[] = []
	let paths: IModelRelationship[] = []

	if (population) {
		modelRelationship = await ModelRelationship.find({
			$and: [{ app: app!._id }],
		}).lean()
		paths = population
			.map((e: any) =>
				modelRelationship.find(
					(r) =>
						r.alias === e.path &&
						r.localModel.toString() === model!._id.toString()
				)
			)
			.filter((e: any) => e) as IModelRelationship[]
	}

	return { paths, modelRelationship }
}

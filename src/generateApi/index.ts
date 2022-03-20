import { ID, IModel, IModelRelationship, ModelTypes } from "../types"
import express from "express"
import Joi from "joi"
import aqp from "api-query-params"

const router = express.Router()
import { ObjectId } from "mongodb"
import { apiNamespace } from "../utils/apiNamespace"
import {
	mapToJoi,
	apiModel,
	validateApp,
	populate,
} from "../utils/generateApiHelper"
import { clamp } from "../utils/helpers"
import { ModelRelationship } from "../models"

router.use(express.json())

router.get("/rest/:slug/:modelName", async (req, res) => {
	const { params } = req
	const { filter, skip, limit, sort, projection, population } = aqp(req.query)

	try {
		const { app, model, ...result } = await validateApp({
			appSlug: params.slug,
			modelName: params.modelName,
			methodName: "GET_ALL",
		})

		if (!result.status) {
			res.status(result.code!).json({ mesage: result.message })
			return
		}

		const dbName = apiNamespace.dbName(app!.user as ID)
		const colName = apiNamespace.colName(app!._id, model!._id)
		const col = await apiModel({ dbName, colName })

		const regexFilter: Record<string, any> = {}

		if (Object.keys(filter).length) {
			Object.entries(filter).forEach(([k, v]) => {
				regexFilter[k] = { $regex: new RegExp(v, "gi") }
			})
		}

		const $filter = Object.keys(regexFilter).length ? regexFilter : {}

		if (population.length) {
			const data = await populate({
				population,
				app,
				model,
				$filter,
				limit,
				skip,
				col,
				sort,
				projection,
			})
			res.send({
				totalCounts: await col.countDocuments(),
				data,
				filter: $filter,
				skip: skip || 0,
				limit: clamp(limit, 100, 10),
				sort,
			})
		} else {
			const data = await col
				.find()
				.filter($filter)
				.skip(skip || 0)
				.limit(clamp(limit, 100, 10))
				.sort(sort as any)
				.project(projection)

				.toArray()

			res.send({
				totalCounts: await col.countDocuments(),
				data,
				filter: $filter,
				skip: skip || 0,
				limit: clamp(limit, 100, 10),
				sort,
			})
		}
	} catch (error: any) {
		res.status(500).send({ error: error.message })
	}
})

router.get("/rest/:slug/:modelName/:id", async (req, res) => {
	const { params } = req

	try {
		const { app, model, ...result } = await validateApp({
			appSlug: params.slug,
			modelName: params.modelName,
			methodName: "GET_ONE",
		})

		if (!result.status) {
			res.status(result.code!).json({ mesage: result.message })
			return
		}

		const dbName = apiNamespace.dbName(app!.user as ID)
		const colName = apiNamespace.colName(app!._id, model!._id)
		const col = await apiModel({ dbName, colName })

		const data = await col.findOne({
			_id: ObjectId.createFromHexString(params.id),
		})

		if (!data) {
			res.sendStatus(404)
			return
		}

		res.send(data)
	} catch (error: any) {
		res.status(500).send({ error: error.message })
	}
})

router.post("/rest/:slug/:modelName", async (req, res) => {
	const { params, body } = req
	try {
		const { app, model, ...result } = await validateApp({
			appSlug: params.slug,
			modelName: params.modelName,
			methodName: "POST",
		})

		if (!result.status) {
			res.status(result.code!).json({ mesage: result.message })
			return
		}

		const obj: any = {}
		const mapFields: Record<string, ModelTypes> = {}
		for (const field of model!.fields) {
			if (field.name !== "_id") {
				obj[field.name] = mapToJoi(field.type, field.required)
			}
			mapFields[field.name] = field.type
		}

		const { error } = Joi.object(obj).validate(body)

		if (error) {
			res
				.status(400)
				.json({ message: error.details[0].message.replace(/\"/g, "") })
			return
		}

		const dbName = apiNamespace.dbName(app!.user as ID)
		const colName = apiNamespace.colName(app!._id, model!._id)
		const col = await apiModel({ dbName, colName })

		Object.entries(body).forEach(([k, v]) => {
			console.log(mapFields[k])
			if (mapFields[k] === "OBJECT_ID") {
				body[k] = new ObjectId(v as string)
			}
		})

		const data = await col.insertOne(body)

		res.status(201).send(await col.findOne({ _id: data.insertedId }))
	} catch (error: any) {
		res.status(500).json({
			error: error.message,
		})
	}
})

router.patch("/rest/:slug/:modelName/:id", async (req, res) => {
	const { params, body } = req

	try {
		const { app, model, ...result } = await validateApp({
			appSlug: params.slug,
			modelName: params.modelName,
			methodName: "PATCH",
		})

		if (!result.status) {
			res.status(result.code!).json({ mesage: result.message })
			return
		}

		const obj: any = {}

		for (const field of model!.fields) {
			if (field.name !== "_id") {
				obj[field.name] = mapToJoi(field.type, field.required)
			}
		}

		const { error } = Joi.object(obj).validate(body)

		if (error) {
			res.status(400).json({
				message: `${error.details[0].path} is not allowed.`,
			})
			return
		}
		const dbName = apiNamespace.dbName(app!.user as ID)
		const colName = apiNamespace.colName(app!._id, model!._id)
		const col = await apiModel({ dbName, colName })
		await col.updateOne(
			{ _id: ObjectId.createFromHexString(params.id) },
			{ $set: body }
		)

		res.send(
			await col.findOne({ _id: ObjectId.createFromHexString(params.id) })
		)
	} catch (error: any) {
		console.log(error.message)
		res.status(500).json({
			error: error.message,
		})
	}
})

router.delete("/rest/:slug/:modelName/:id", async (req, res) => {
	const { params } = req

	try {
		const { app, model, ...result } = await validateApp({
			appSlug: params.slug,
			modelName: params.modelName,
			methodName: "DELETE",
		})

		if (!result.status) {
			res.status(result.code!).json({ mesage: result.message })
			return
		}

		const dbName = apiNamespace.dbName(app!.user as ID)
		const colName = apiNamespace.colName(app!._id, model!._id)
		const col = await apiModel({ dbName, colName })

		const data = await col.deleteOne({
			_id: ObjectId.createFromHexString(params.id),
		})

		if (!data.deletedCount) return res.status(404)

		res.sendStatus(204)
	} catch (error) {
		res.send({ error })
	}
})

export default router

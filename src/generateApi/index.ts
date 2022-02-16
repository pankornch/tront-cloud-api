import App from "@/models/App"
import Model from "@/models/Model"
import { ID } from "@/types"
import express from "express"
import Joi from "joi"
import aqp from "api-query-params"

const router = express.Router()
import { ObjectId } from "mongodb"
import { apiNamespace } from "@/utils/apiNamespace"
import {
	validateApiMethod,
	mapToJoi,
	apiModel,
} from "@/utils/generateApiHelper"

router.use(express.json())

router.get("/rest/:slug/:modelName", async (req, res) => {
	const { params } = req
	const { filter, skip, limit, sort } = aqp(req.query)

	const app = await App.findOne({
		slug: params.slug,
	})
	if (!app) {
		res.status(404).json({ message: `${params.slug} not found` })
		return
	}

	const model = await Model.findOne({
		$and: [
			{
				app: app._id,
			},
			{
				name: params.modelName,
			},
		],
	}).lean()

	if (!model) {
		res.status(404).json({ message: `${params.modelName} not found` })
		return
	}

	const result = await validateApiMethod({
		model,
		params,
		methodName: "GET_ALL",
	})

	if (!result.status) {
		res.status(result!.code!).send(result.message)
		return
	}
	;`tront:${app.user}`
	const dbName = apiNamespace.dbName(app.user as ID)
	const colName = apiNamespace.colName(app._id, model._id)
	const col = await apiModel({ dbName, colName })
	const data = await col
		.find()
		.filter(filter)
		.skip(skip || 0)
		.limit(limit || 10)
		.sort(sort as any)
		.toArray()

	res.send({
		data,
		filter,
		skip,
		limit,
		sort,
	})
})

router.get("/rest/:slug/:modelName/:id", async (req, res) => {
	const { params } = req

	try {
		const app = await App.findOne({
			slug: params.slug,
		})
		if (!app) {
			res.status(404).json({ message: `${params.slug} not found` })
			return
		}
		const model = await Model.findOne({
			$and: [
				{
					app: app._id,
				},
				{
					name: params.modelName,
				},
			],
		}).lean()

		if (!model) {
			res.status(404).json({ message: `${params.modelName} not found` })
			return
		}

		const result = await validateApiMethod({
			model,
			params,
			methodName: "GET_ONE",
		})

		if (!result.status) {
			res.status(result!.code!).send(result.message)
			return
		}

		const dbName = `tront:${app.user}`
		const colName = `${app._id}:${model._id}`
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
		res.send({ error: error.message })
	}
})

router.post("/rest/:slug/:modelName", async (req, res) => {
	const { params, body } = req
	try {
		const app = await App.findOne({
			slug: params.slug,
		})
		if (!app) {
			res.status(404).json({ message: `${params.slug} not found` })
			return
		}
		const model = await Model.findOne({
			$and: [
				{
					app: app._id,
				},
				{
					name: params.modelName,
				},
			],
		}).lean()

		if (!model) {
			res.status(404).json({ message: `${params.modelName} not found` })
			return
		}

		const result = await validateApiMethod({
			model,
			params,
			methodName: "POST",
		})

		if (!result.status) {
			res.status(result!.code!).send(result.message)
			return
		}

		const obj: any = {}

		for (const field of model.fields) {
			if (field.name !== "_id") {
				obj[field.name] = mapToJoi(field.type, field.required)
			}
		}

		const { error } = Joi.object(obj).validate(body)

		if (error) {
			res
				.status(400)
				.json({ message: error.details[0].message.replace(/\"/g, "") })
			return
		}

		const dbName = `tront:${app.user}`
		const colName = `${app._id}:${model._id}`
		const col = await apiModel({ dbName, colName })
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
		const app = await App.findOne({
			slug: params.slug,
		})
		if (!app) {
			res.status(404).json({ message: `${params.slug} not found` })
			return
		}
		const model = await Model.findOne({
			$and: [
				{
					app: app._id,
				},
				{
					name: params.modelName,
				},
			],
		}).lean()

		if (!model) {
			res.status(404).json({ message: `${params.modelName} not found` })
			return
		}

		const result = await validateApiMethod({
			model,
			params,
			methodName: "PATCH",
		})

		if (!result.status) {
			res.status(result!.code!).send(result.message)
			return
		}

		const obj: any = {}

		for (const field of model.fields) {
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
		const dbName = `tront:${app.user}`
		const colName = `${app._id}:${model._id}`
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
		const app = await App.findOne({
			slug: params.slug,
		})
		if (!app) {
			res.status(404).json({ message: `${params.slug} not found` })
			return
		}
		const model = await Model.findOne({
			$and: [
				{
					app: app._id,
				},
				{
					name: params.modelName,
				},
			],
		}).lean()

		if (!model) {
			res.status(404).json({ message: `${params.modelName} not found` })
			return
		}

		const result = await validateApiMethod({
			model,
			params,
			methodName: "DELETE",
		})

		if (!result.status) {
			res.status(result!.code!).send(result.message)
			return
		}

		const dbName = `tront:${app.user}`
		const colName = `${app._id}:${model._id}`
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

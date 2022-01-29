import App from "@/models/App"
import Model from "@/models/Model"
import { ApiNames, IModel, ModelTypes } from "@/types"
import express from "express"
import Joi from "joi"
import aqp from "api-query-params"

const router = express.Router()
import { MongoClient, ObjectId } from "mongodb"
import ApiSchema from "@/models/ApiSchema"
router.use(express.json())

const url = "mongodb://localhost:27017"
const client = new MongoClient(url)

const apiModel = async ({ dbName, colName }: any) => {
	await client.connect()
	const db = client.db(dbName)

	const col = db.collection(colName)
	return col
}

const mapToJoi = (type: ModelTypes, required: boolean) => {
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
	params: Record<string, any>
	methodName: ApiNames
}

const validateApiMethod = async ({
	model,
	params,
	methodName,
}: ValidateApiMetodProps) => {
	const apiSchema = await ApiSchema.findOne({
		model: model._id,
	}).lean()

	if (!apiSchema) {
		return {
			status: false,
			code: 404,
			message: `${params.modelName} not found`,
		}
	}

	const method = apiSchema.methods.find((e) => e.name === methodName)!

	if (!method.active) {
		return {
			status: false,
			code: 403,
			message: "",
		}
	}

	return {
		status: true,
	}
}

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

	const dbName = `tront:${app.user}`
	const colName = `${app._id}:${model._id}`
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
				.json({ message: `${error.details[0].path} is not allowed.` })
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

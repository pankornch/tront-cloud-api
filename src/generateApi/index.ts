import App from "@/models/App"
import Field from "@/models/Field"
import Model from "@/models/Model"
import { ModelTypes } from "@/types"
import express from "express"
import Joi from "joi"

const router = express.Router()
import { MongoClient, ObjectId } from "mongodb"
router.use(express.json())

const url = "mongodb://localhost:27018"
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
	}

	if (required) joi = joi.required()
	return joi
}

router.get("/rest/:slug/:modelName", async (req, res) => {
	const { params } = req
	const app = await App.findOne({
		slug: params.slug,
	})
	if (!app) {
		res.status(403).json({ message: "Incorrect app" })
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

	const dbName = `tront:${app.user}`
	const colName = `${app._id}:${model!.name}`
	const col = await apiModel({ dbName, colName })
	const data = await col.find({}).toArray()

	client.close()

	res.send({
		data,
	})
})

router.get("/rest/:slug/:modelName/:id", async (req, res) => {
	const { params } = req

	try {
		const app = await App.findOne({
			slug: params.slug,
		})
		if (!app) {
			throw new Error("Incorrect app")
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
			throw new Error("Incorrect model")
		}

		const dbName = `tront:${app.user}`
		const colName = `${app._id}:${model.name}`
		const col = await apiModel({ dbName, colName })

		const data = await col.findOne({
			_id: ObjectId.createFromHexString(params.id),
		})
		client.close()
		res.send({ data })
	} catch (error) {
		console.log(error)
		res.send({ error })
	}
})

router.post("/rest/:slug/:modelName", async (req, res) => {
	const { params, body } = req
	try {
		const app = await App.findOne({
			slug: params.slug,
		})
		if (!app) {
			throw new Error("Incorrect app")
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
			throw new Error("Incorrect model")
		}

		const fields = await Field.find({
			model: model._id,
		}).lean()

		const obj = fields.reduce((acc: any, curr) => {
			acc[curr.name] = mapToJoi(curr.type, curr.required)
			return acc
		}, {})

		const { error } = Joi.object(obj).validate(body)

		if (error) {
			res.status(400).json({ error })
			return
		}

		const dbName = `tront:${app.user}`
		const colName = `${app._id}:${model.name}`
		const col = await apiModel({ dbName, colName })
		const data = await col.insertOne(body)
		client.close()
		res.send({ data })
	} catch (error) {
		res.status(400).json({
			error: error,
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
			throw new Error("Incorrect app")
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
			throw new Error("Incorrect model")
		}

		const fields = await Field.find({
			model: model._id,
		}).lean()

		const obj = fields.reduce((acc: any, curr) => {
			acc[curr.name] = mapToJoi(curr.type, false)
			return acc
		}, {})

		const { error } = Joi.object(obj).validate(body)

		if (error) {
			res.status(400).json({ error })
			return
		}
		const dbName = `tront:${app.user}`
		const colName = `${app._id}:${model.name}`
		const col = await apiModel({ dbName, colName })
		const data = await col.updateOne(
			{ _id: ObjectId.createFromHexString(params.id) },
			{ $set: body }
		)
		client.close()
		res.send({ data })
	} catch (error) {
		res.send({ error })
	}
})

router.delete("/rest/:slug/:modelName/:id", async (req, res) => {
	const { params } = req

	try {
		const app = await App.findOne({
			slug: params.slug,
		})
		if (!app) {
			throw new Error("Incorrect app")
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
			throw new Error("Incorrect model")
		}

		const dbName = `tront:${app.user}`
		const colName = `${app._id}:${model.name}`
		const col = await apiModel({ dbName, colName })

		const result = await col.deleteOne({
			_id: ObjectId.createFromHexString(params.id),
		})
		client.close()
		res.send({ result })
	} catch (error) {
		res.send({ error })
	}
})

export default router

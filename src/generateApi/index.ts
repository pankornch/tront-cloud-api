import App from "@/models/App"
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

	const dbName = `tront:${app.user}`
	const colName = `${app._id}:${model._id}`
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

		const dbName = `tront:${app.user}`
		const colName = `${app._id}:${model._id}`
		const col = await apiModel({ dbName, colName })

		const data = await col.findOne({
			_id: ObjectId.createFromHexString(params.id),
		})
		client.close()
		res.send({ data })
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

		const obj = model.fields!.reduce((acc: any, curr) => {
			acc[curr.name] = mapToJoi(curr.type, curr.required)
			return acc
		}, {})

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
		client.close()
		res.send({ data })
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

		const obj = model.fields.reduce((acc: any, curr) => {
			acc[curr.name] = mapToJoi(curr.type, false)
			return acc
		}, {})

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
		const data = await col.updateOne(
			{ _id: ObjectId.createFromHexString(params.id) },
			{ $set: body }
		)
		client.close()
		res.send({ data })
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

		const dbName = `tront:${app.user}`
		const colName = `${app._id}:${model._id}`
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

import { faker } from "@faker-js/faker"
import mongoose from "mongoose"
import { IApp, ID } from "types"
import MutationResolvers from "../src/resolvers/Mutation"
import QueryResolvers from "../src/resolvers/Query"

export const authToken = (token: string) => `Bearer ${token}`

export const clearAllCollections = async () => {
	const collections = await mongoose.connection.db.collections()
	for (const col of collections) {
		await col.deleteMany({})
	}
}

export interface CreateUser {
	email: string
	password: string
	confirmPassword: string
}
export const createUser = async (
	input?: CreateUser
): Promise<[any, CreateUser]> => {
	const password = faker.random.words(6)

	const mockUser: CreateUser = {
		email: faker.internet.email(),
		password: password,
		confirmPassword: password,
	}

	const data = input || mockUser

	return [
		await MutationResolvers.signUp(
			null,
			{ input: data },
			{ req: {}, authorization: "" },
			undefined
		),
		data,
	]
}

interface CreateApp {
	name: string
	description?: string
	slug: string
}
export const createApp = async (
	token: string,
	input?: CreateApp
): Promise<[IApp, CreateApp]> => {
	const mockApp: CreateApp = {
		name: faker.random.words(5),
		description: faker.random.words(10),
		slug: faker.random.words(3),
	}

	const data = input || mockApp

	return [
		await MutationResolvers.createApp(
			null,
			{ input: data },
			{ req: {}, authorization: authToken(token) },
			undefined
		),
		mockApp,
	]
}

export const getApps = async (token: string) => {
	return await QueryResolvers.apps(
		null,
		{},
		{ req: {}, authorization: authToken(token) },
		undefined
	)
}

export const getAppById = async (token: string, _id: ID) => {
	return await QueryResolvers.app(
		null,
		{ _id },
		{ req: {}, authorization: authToken(token) },
		undefined
	)
}

interface EditApp {
	_id: ID
	name: string
	description?: string
	slug: string
}
export const updateApp = (token: string, input: EditApp) => {
	return MutationResolvers.updateApp(
		null,
		{ input },
		{ req: {}, authorization: authToken(token) },
		undefined
	)
}

export const deleteApp = async (token: string, _id: ID) => {
	return await MutationResolvers.deleteApp(
		null,
		{ input: { _id } },
		{ req: {}, authorization: authToken(token) },
		undefined
	)
}

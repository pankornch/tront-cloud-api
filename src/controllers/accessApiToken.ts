import { ApiTokenTypes, EnumApiTokenTypes, IApiToken, Resolver } from "@/types"
import { createToken } from "@/utils/jwt"
import ApiToken from "@/models/ApiToken"
import dotenv from "dotenv"
import App from "@/models/App"
import { UserInputError } from "apollo-server-core"
import shortid from "shortid"
import Model from "@/models/Model"
dotenv.config()

const JWT_API_ACCESS_TOKEN_SECRET = "97ace9d417739cc9744ba"

interface GetAccessTokenInput {
	type: ApiTokenTypes
	subId: string
}

export const getAcessToken: Resolver<
	any,
	{ input: GetAccessTokenInput }
> = async (_, { input }, { user }) => {
	switch (input.type) {
		case "APP":
			const app = await App.findOne({
				$and: [
					{
						_id: input.subId,
					},
					{
						user: user!._id,
					},
				],
			})

			if (!app) {
				throw new UserInputError("incorrect subId")
			}
			break

		case "MODEL":
			const model = await Model.findOne({
				$and: [
					{
						_id: input.subId,
					},
					{
						user: user!._id,
					},
				],
			})

			if (!model) {
				throw new UserInputError("incorrect subId")
			}
			break
	}

	let apiToken = await ApiToken.findOne({
		$and: [
			{
				type: input.type,
			},
			{
				subId: input.subId,
			},
		],
	}).lean()

	if (!apiToken) {
		return ""
	}

	return apiToken.token
}

interface CreateAccessToken {
	type: ApiTokenTypes
	subId: string
}
export const createAccessToken: Resolver<
	any,
	{ input: CreateAccessToken }
> = async (_, { input }, { user }) => {
	switch (input.type) {
		case "APP":
			const app = await App.findOne({
				$and: [
					{
						_id: input.subId,
					},
					{
						user: user!._id,
					},
				],
			})

			if (!app) {
				throw new UserInputError("incorrect subId")
			}
			break

		case "MODEL":
			const model = await Model.findOne({
				$and: [
					{
						_id: input.subId,
					},
					{
						user: user!._id,
					},
				],
			})

			if (!model) {
				throw new UserInputError("incorrect subId")
			}
			break
	}

	const ttl = Date.now() + 10 * 1000

	const token = createToken(
		{
			sub: input.subId,
			type: input.type,
		},
		{
			secret: JWT_API_ACCESS_TOKEN_SECRET,
			expiresIn: ttl,
		}
	)

	await ApiToken.create({
		subId: input.subId,
		type: input.type,
		expiredAt: new Date(ttl),
		version: shortid.generate(),
		token,
	})

	return token
}

interface RevokeAccessToken {
	type: ApiTokenTypes
	subId: string
}
export const revokeAccessToken: Resolver<
	any,
	{ input: RevokeAccessToken }
> = () => {}

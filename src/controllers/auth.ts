import { Resolver } from "../types/gql"
import { Account, User } from "../models"
import Joi from "joi"
import { UserInputError, AuthenticationError } from "apollo-server-core"
import { AuthTypes, EnumAuthTypes } from "../types"
import bcrypt from "bcryptjs"
import { createToken } from "../utils/jwt"

interface SignInInput {
	email: string
	password: string
}

interface SignUpInput extends SignInInput {
	confirmPassword: string
}

interface OauthInput {
	type: AuthTypes
	providerAccountId: string
	email: string
	avatar: string,
}

export const signIn: Resolver<null, { input: SignInInput }> = async (
	_,
	{ input }
) => {
	const account = await Account.findOne({
		type: EnumAuthTypes.CREDENTIALS,
		email: input.email,
	})

	if (!account) {
		throw new AuthenticationError("Incorrect credentials")
	}

	if (!bcrypt.compareSync(input.password, account.password!)) {
		throw new AuthenticationError("Incorrect credentials")
	}

	const user = await User.findById(account.user).lean()

	const token = createToken(user!._id.toString())

	return {
		token,
		user,
	}
}

export const signUp: Resolver<
	null,
	{
		input: SignUpInput
	}
> = async (_, { input }) => {
	const { error } = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().min(6).required(),
		confirmPassword: Joi.equal(Joi.ref("password")).required(),
	}).validate(input)

	if (error) {
		throw new UserInputError(error.details.map((e) => e.message).toString())
	}

	const isExist = await Account.findOne({
		$and: [{ type: EnumAuthTypes.CREDENTIALS }, { email: input.email }],
	})

	if (isExist) {
		throw new UserInputError(`${input.email} had already sign up!`)
	}

	const account = new Account({
		type: EnumAuthTypes.CREDENTIALS,
		email: input.email,
		password: bcrypt.hashSync(input.password),
	})

	const user = new User({
		email: input.email,
		accounts: [account._id],
	})

	account.user = user._id
	user.avatar = `https://avatars.dicebear.com/api/identicon/${user._id}.svg`

	await Promise.all([user.save(), account.save()])

	const token = createToken(user!._id.toString())

	return {
		token,
		user,
	}
}

export const oauth: Resolver<null, { input: OauthInput }> = async (
	_,
	{ input }
) => {
	const accountExist = await Account.findOne({
		type: input.type,
		providerAccountId: input.providerAccountId,
	})

	if (!accountExist) {
		const account = new Account({
			type: input.type,
			email: input.email,
			providerAccountId: input.providerAccountId,
		})

		const user = new User({
			email: input.email,
			accounts: [account._id],
			avatar: input.avatar,
		})

		account.user = user._id

		await Promise.all([user.save(), account.save()])

		const token = createToken(user._id.toString())

		return {
			token,
			user,
		}
	}

	const token = createToken(accountExist.user.toString())

	const user = await User.findById(accountExist.user)

	return {
		token,
		user,
	}
}

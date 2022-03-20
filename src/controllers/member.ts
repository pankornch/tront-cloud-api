import { UserInputError } from "apollo-server-core"
import { User, App, Member } from "../models"
import { ID, Resolver } from "../types"

interface SendInviteInput {
	input: {
		email: string
		appId: string
	}
}
export const sendInvite: Resolver<null, SendInviteInput> = async (
	_,
	{ input },
	{ user }
) => {
	const existEmail = await User.findOne({ email: input.email })

	if (!existEmail) {
		throw new UserInputError(`this email: ${input.email} not exist`)
	}

	const validateApp = await App.findOne({
		$and: [{ user: user?._id }, { _id: input.appId }],
	})

	if (!validateApp) {
		throw new UserInputError(`Incorrect app id: ${input.appId}`)
	}

	const existMember = await Member.findOne({
		$and: [{ app: input.appId }, { user: existEmail._id }],
	})

	if (!existMember) {
		return await Member.create({
			app: input.appId,
			user: existEmail._id,
		})
	}

	return existMember
}

interface GetAccessApiTokenInput {
	input: {
		appId: ID
	}
}
export const getMembersByApp: Resolver<null, GetAccessApiTokenInput> = async (_, {input}, {user}) => {
    const members = await Member.find({app: input.appId})

    return members
}
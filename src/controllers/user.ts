import { User } from "../models"
import { Resolver } from "../types"

interface SearchUserInput {
	input: {
		email: string
	}
}
export const searchUser: Resolver<null, SearchUserInput> = async (
	_,
	{ input }
) => {
	const users = await User.find({
		email: new RegExp(input.email, "i"),
	}).lean()

	return users
}

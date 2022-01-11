import { User } from "@/models"
import { Resolver } from "@/types"
import { verifyToken } from "@/utils/jwt"
import { AuthenticationError } from "apollo-server-core"

export const auth = (handler: Resolver): Resolver => {
	return async (parent, args, context, info) => {
		try {
			const decoded = verifyToken(context.authorization)
			const user = await User.findById(decoded.sub).lean()

			if (!user) {
				throw new Error("Invalid user")
			}

			context.user = user
			return handler(parent, args, context, info)
		} catch (error: any) {
			throw new AuthenticationError(error.message)
		}
	}
}

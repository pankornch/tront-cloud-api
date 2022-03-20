import { ResolverType, IMember } from "../../types"
import { App, User } from "../../models"
export const MemberResolver: ResolverType<IMember> = {
	app: async (parent) => {
		const app = await App.findById(parent.app).lean()
		return app
	},
	user: async (parent) => {
		const user = await User.findById(parent.user).lean()
		return user
	}
}

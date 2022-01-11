import App from "@/models/App"
import { IApp, Resolver } from "@/types"

interface CreateAppInput extends IApp {}
export const createApp: Resolver<null, { input: CreateAppInput }> = async (
	parent,
	{ input },
	{ user }
) => {
	const app = new App({
		name: input.name,
		slug: input.slug,
		user: user!._id,
	})

	await app.save()
	return app
}

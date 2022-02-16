import * as appController from "@/controllers/app"
import { auth } from "@/middlewares/auth"
import * as accessApiToken from "@/controllers/accessApiToken"

export default {
	hello: () => {
		return "Hello"
	},
	apps: auth(appController.getApps),
	app: auth(appController.getAppBySlug),

	getAccessApiToken: auth(accessApiToken.getAcessToken),
}

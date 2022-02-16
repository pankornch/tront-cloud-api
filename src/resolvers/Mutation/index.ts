import { auth } from "@/middlewares/auth"
import * as authController from "@/controllers/auth"
import * as appController from "@/controllers/app"
import * as accessApiToken from "@/controllers/accessApiToken"
import * as schemaController from "@/controllers/schema"

export default {
	signIn: authController.signIn,
	signUp: authController.signUp,
	oauth: authController.oauth,

	createApp: auth(appController.createApp),
	updateApp: auth(appController.updateApp),
	deleteApp: auth(appController.deleteApp),

	createSchema: auth(schemaController.createSchema),
	deleteSchema: auth(schemaController.deleteSchema),

	createAccessApiToken: auth(accessApiToken.createAccessToken),
}

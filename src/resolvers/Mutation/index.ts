import * as authController from "@/controllers/auth"
import * as appController from "@/controllers/app"
import { auth } from "@/middlewares/auth"

export default {
	signIn: authController.signIn,
	signUp: authController.signUp,
	oauth: authController.oauth,

	createApp: auth(appController.createApp),
	updateApp: auth(appController.updateApp),
	deleteApp: auth(appController.deleteApp)
}

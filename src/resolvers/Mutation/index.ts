import { auth } from "../../middlewares/auth"
import * as authController from "../../controllers/auth"
import * as appController from "../../controllers/app"
import * as schemaController from "../../controllers/schema"
import * as memberController from "../../controllers/member"

export default {
	signIn: authController.signIn,
	signUp: authController.signUp,
	oauth: authController.oauth,

	createApp: auth(appController.createApp),
	updateApp: auth(appController.updateApp),
	deleteApp: auth(appController.deleteApp),

	createSchema: auth(schemaController.createSchema),
	updateSchema: auth(schemaController.updateSchema),
	deleteSchema: auth(schemaController.deleteSchema),

	sendInvite: auth(memberController.sendInvite),
	actionInvite: auth(appController.actionInvite),
}

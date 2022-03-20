import * as appController from "../../controllers/app"
import { auth } from "../../middlewares/auth"

import * as userController from "../../controllers/user"
import * as memberController from "../../controllers/member"
export default {
	hello: () => {
		return "Hello"
	},
	apps: auth(appController.getApps),
	app: auth(appController.getAppBySlug),

	searchUser: userController.searchUser,
	getMembersByApp: auth(memberController.getMembersByApp),
	getAppInvite: auth(appController.getAppInvite),
}

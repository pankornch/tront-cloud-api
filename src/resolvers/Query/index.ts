import * as appController from "@/controllers/app"
import { auth } from "@/middlewares/auth"

export default {
	hello: () => {
		return "Hello"
	},
	apps: auth(appController.getApps),
}

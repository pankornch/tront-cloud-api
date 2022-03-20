import MutationResolvers from "../src/resolvers/Mutation"
import db from "../src/configs/db"
const conn = db.bind(null, "mongodb://localhost:27017/tront-test")
import {
	clearAllCollections,
	createApp,
	createUser,
	deleteApp,
	getAppById,
	getApps,
	updateApp,
} from "./helpers"
import faker from "@faker-js/faker"

beforeAll(async () => {
	await conn()
	await clearAllCollections()
})

afterEach(async () => {
	await clearAllCollections()
})

describe("Test Sign up", () => {
	test("Sign up with email and password which not existing in database", async () => {
		const [res, input] = await createUser()

		expect(res).toHaveProperty("token")
		expect(res).toHaveProperty("user")
		expect(res.user.email).toBe(input.email)
	})

	test("Sign up with email and password which existing in database", async () => {
		const [_, input] = await createUser()

		try {
			await createUser(input)
		} catch (error: any) {
			expect(error.message).toBe(`${input.email} had already sign up!`)
		}
	})
})

describe("Test Sign in", () => {
	test("Sign in with email and password are both correct", async () => {
		const [_, signUpInput] = await createUser()

		const signInInput = {
			email: signUpInput.email,
			password: signUpInput.password,
		}

		const res = await MutationResolvers.signIn(
			null,
			{ input: signInInput },
			{ req: {}, authorization: "" },
			undefined
		)

		expect(res).toHaveProperty("token")
		expect(res).toHaveProperty("user")
		expect(res.user.email).toBe(signInInput.email)
	})

	test("Sign in with email and password but email not in database", async () => {
		const [_, signUpInput] = await createUser()

		const signInInput = {
			email: signUpInput.email + faker.random.word,
			password: signUpInput.password,
		}

		try {
			await MutationResolvers.signIn(
				null,
				{ input: signInInput },
				{ req: {}, authorization: "" },
				undefined
			)
		} catch (error: any) {
			expect(error.message).toBe("Incorrect credentials")
		}
	})

	test("Sign in with email and password but password is incorrect", async () => {
		const [_, signUpInput] = await createUser()

		const signInInput = {
			email: signUpInput.email,
			password: signUpInput.password + faker.random.word,
		}

		try {
			await MutationResolvers.signIn(
				null,
				{ input: signInInput },
				{ req: {}, authorization: "" },
				undefined
			)
		} catch (error: any) {
			expect(error.message).toBe("Incorrect credentials")
		}
	})
})

describe("App test", () => {
	test("Create App with authorization", async () => {
		const [user] = await createUser()
		const [app, createAppInput] = await createApp(user.token)

		expect(app.name).toBe(createAppInput.name)
		expect(app.slug).toBe(createAppInput.slug)
		expect(app.description).toBe(createAppInput.description)
	})

	test("Create App with no authorization", async () => {
		try {
			await createApp("")
		} catch (error: any) {
			expect(error.message).toBe("jwt must be provided")
		}
	})

	test("Get Apps with owner", async () => {
		const [user] = await createUser()
		const [app, createAppInput] = await createApp(user.token)

		const apps = await getApps(user.token)

		expect(apps[0].name).toBe(createAppInput.name)
	})

	test("Get Apps which not owner", async () => {
		const [user] = await createUser()
		const [user2] = await createUser()
		const [app] = await createApp(user.token)

		try {
			await getAppById(user2.token, app._id)
		} catch (error: any) {
            expect(error.message).toBe("Incorrect app")
        }
	})

	test("Edit App with owner", async () => {
		const [user] = await createUser()
		const [app, createAppInput] = await createApp(user.token)
		const editInput = {
			...createAppInput,
			_id: app._id,
			name: "Test",
		}
		const updatedApp = await updateApp(user.token, editInput)
		expect(updatedApp.name).toBe(editInput.name)
	})

	test("Edit App which not owner", async () => {
		const [user1] = await createUser()
		const [user2] = await createUser()
		const [app1] = await createApp(user1.token)
		const [app2, createAppInput2] = await createApp(user2.token)
		const editInput = {
			...createAppInput2,
			_id: app2._id.toString(),
		}

		try {
			await updateApp(user1.token, editInput)
		} catch (error: any) {
			expect(error.message).toBe("Incorrect app id")
		}
	})

	test("Delete app with owner", async () => {
		const [user] = await createUser()
		const [app] = await createApp(user.token)
		const deletedApp = await deleteApp(user.token, app._id)
		expect(deletedApp).toBe("Delete Successful")
	})

	test("Delete app which not owner", async () => {
		const [user] = await createUser()
		const [user2] = await createUser()
		const [app] = await createApp(user.token)
		try {
			await deleteApp(user2.token, app._id)
		} catch (error: any) {
			expect(error.message).toBe("Incorrect app id")
		}
	})
})

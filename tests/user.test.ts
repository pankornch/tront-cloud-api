import MutationResolvers from "../src/resolvers/Mutation"
import { Account, User } from "../src/models"
import db from "../src/configs/db"
const conn = db.bind(null, "mongodb://localhost:27017/tront-test")

beforeAll(async () => {
	await conn()
})

afterEach(async () => {
	await Promise.all([Account.deleteMany(), User.deleteMany()])
})

describe("Test Sign up", () => {
	test("Sign up with email and password which not existing in database", async () => {
        const input = {
            email: "test1234@gmail.com",
            password: "123456",
            confirmPassword: "123456",
        }

		const res = await MutationResolvers.signUp(
			null,
			{
				input: input,
			},
			{ req: {}, authorization: "" },
			undefined
		)

		expect(res).toHaveProperty("token")
		expect(res).toHaveProperty("user")
        expect(res.user.email).toBe(input.email)
	})

	test("Sign up with email and password which existing in database", async () => {
        const input = {
            email: "test1234@gmail.com",
            password: "123456",
            confirmPassword: "123456",
        }

        await MutationResolvers.signUp(
			null,
			{
				input,
			},
			{ req: {}, authorization: "" },
			undefined
		)

        try {
            await MutationResolvers.signUp(
                null,
                {
                    input
                },
                { req: {}, authorization: "" },
                undefined
            )
    
        } catch (error: any) {
            expect(error.message).toBe(`${input.email} had already sign up!`)
        }
    })
})


describe("Sign in", () => {
    test("Sign in with email and password are both correct", async () => {
        const signUpInput = {
            email: "test1234@gmail.com",
            password: "123456",
            confirmPassword: "123456",
        }
        
        const signInInput = {
            email: "test1234@gmail.com",
            password: "123456",
        }
        
        await MutationResolvers.signUp(
			null,
			{
				input: signUpInput,
			},
			{ req: {}, authorization: "" },
			undefined
		)

        const res = await MutationResolvers.signIn(null, {input:signInInput}, {req: {}, authorization: ""}, undefined)
        expect(res).toHaveProperty("token")
		expect(res).toHaveProperty("user")
        expect(res.user.email).toBe(signInInput.email)
    })

    test("Sign in with email and password but email not in database", async () => {
        const signUpInput = {
            email: "test1234@gmail.com",
            password: "123456",
            confirmPassword: "123456",
        }
        
        const signInInput = {
            email: "test12341111@gmail.com",
            password: "123456",
        }
        
        await MutationResolvers.signUp(
			null,
			{
				input: signUpInput,
			},
			{ req: {}, authorization: "" },
			undefined
		)

        try {
           await MutationResolvers.signIn(null, {input:signInInput}, {req: {}, authorization: ""}, undefined)
        } catch (error: any) {
            expect(error.message).toBe("Incorrect credentials")
        }
    })

    test("Sign in with email and password but password is incorrect", async () => {
        const signUpInput = {
            email: "test1234@gmail.com",
            password: "123456",
            confirmPassword: "123456",
        }
        
        const signInInput = {
            email: "test1234@gmail.com",
            password: "1234561",
        }
        
        await MutationResolvers.signUp(
			null,
			{
				input: signUpInput,
			},
			{ req: {}, authorization: "" },
			undefined
		)

        try {
           await MutationResolvers.signIn(null, {input:signInInput}, {req: {}, authorization: ""}, undefined)
        } catch (error: any) {
            expect(error.message).toBe("Incorrect credentials")
        }
    })
})
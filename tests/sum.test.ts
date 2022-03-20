import QueryResolvers from "../src/resolvers/Query"

const add = (a: number, b: number) => a + b

test("adds 1 + 2 to equal 3", () => {
	expect(add(1, 2)).toBe(3)
})

test("Test Hello Query", async () => {
	const res = QueryResolvers.hello()

	expect(res).toBe("Hello")
})

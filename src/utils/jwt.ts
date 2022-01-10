import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/configs/env"

export const createToken = (payload: any) => {
	return jwt.sign({ sub: payload }, JWT_SECRET!)
}

export const verifyToken = (token: string) => {
	const result = jwt.verify(token, JWT_SECRET!)
	return result
}

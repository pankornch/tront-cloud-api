import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/configs/env"

interface Option {
	secret?: string
	expiresIn?: string | number
}

type CreateTokenProps = (payload: any, option?: Option) => string

export const createToken: CreateTokenProps = (payload: any, option) => {
	return jwt.sign(
		{ sub: payload },
		option?.secret || JWT_SECRET!,
		option?.expiresIn
			? {
					expiresIn: option.expiresIn,
			  }
			: undefined
	)
}

export const verifyToken = (bearerToken: string, secret?: string) => {
	const [bearer, token] = bearerToken.split(" ")
	const result = jwt.verify(token, secret || JWT_SECRET!)
	return result
}

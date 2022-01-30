import { gql } from "apollo-server-core";

export default gql`
    type Mutation {
        signIn(input: SignInInput!): AuthResponse!
        signUp(input: SignUpInput!): AuthResponse!
        oauth(input: OauthInput!): AuthResponse!

        createApp(input: CreateAppInput!): App!
        updateApp(input: UpdateAppInput!): App!
        deleteApp(input: DeleteAppInput!): String!
    }
`
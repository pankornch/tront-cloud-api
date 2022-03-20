import { gql } from "apollo-server-core"

export default gql`
    type User {
        _id: ID
        email: String!
        avatar: String!
        accounts: [Account]!
    }

    type Account {
        _id: ID
        type: AuthTypes
        providerAccountId: ID
    }

    type AuthResponse {
        token: String!
        user: User!
    }

    type App {
        _id: ID!
        user: User!
        name: String!
        description: String
        slug: String!
        active: Boolean!
        modelConfigs: ModelConfigs!
        apiConfigs: ApiConfigs!
        members: [Member]!
        createdAt: Date!
    }

    type ModelConfigs {
        app: App!
        models: [Model]!
        modelRelationships: [ModelRelationship]!
    }

    type Model {
        _id: ID!
        name: String!
        fields: [Field]!
    }

    type Field {
        name: String!
        type: ModelTypes
        required: Boolean!
        defaultValue: String
    }

    type ApiConfigs {
        apiTypes:[ApiType]!
        apiSchemas: [ApiSchema]!
    }

    type ApiType {
        type: ApiTypes!
        url: String!
    }
    
    type ApiSchema {
        _id: ID!
        model: Model!
        methods: [ApiMethod]!
    }

    type ApiMethod {
        name: String!
        pathname: String!
        active: Boolean!
        public: Boolean!
    }

    type Schema {
        model: Model!
        apiSchema: ApiSchema!
    }

    type Member {
        _id: ID!
        app: App!
        user: User!
        role: String!
        status: Boolean!
        createdAt: Date!
        updatedAt: Date!
    }

    type ModelRelationship {
        _id: ID!
        localModel: Model!
        localField: String!
        targetModel: Model!
        hasMany: Boolean!
        alias: String!
    }

    enum AuthTypes {
		GOOGLE
		GITHUB
        CREDENTIALS
	}

    enum ModelTypes {
        OBJECT_ID
        STRING
        NUMBER
        DATE
        OBJECT
        ARRAY
    }

    enum ApiTypes {
        REST
    }

    enum ApiMethodNames {
        GET_LL
        GET_ONE
        POST
        PATCH
        DELETE
    }

    enum AccessApiTokenTypes {
        APP
        MODEL
    }

    scalar Date
`

import { gql } from "apollo-server-core";
import input from "./input";
import Mutation from "./Mutation";
import Query from "./Query";
import types from "./types";

export default gql`
    ${Query}
    ${Mutation}
    ${types}
    ${input}
`
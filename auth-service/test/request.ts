import {server} from "../src/app";
const supertest = require('supertest')

const request = supertest(server)

export default request
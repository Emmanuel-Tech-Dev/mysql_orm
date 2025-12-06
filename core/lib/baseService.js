const loggerService = require("../../shared/helpers/logger");
const utils = require("../../shared/utils/functions");
const Model = require("../model/model");

class BaseService {
  constructor(request, response) {
    this.request = request;
    this.response = response;
  }

  async findAll() {
    const res = await new Model()
      .select(["*"], this.request.params.resources)
      .execute();
    // console.log(res);
    const data = utils.removePasswordFromObject(res);

    return data;
  }

  async findAllWithParams(options = {}) {
    console.log(options);
    const res = await new Model()
      .select(["*"], this.request.params.resources)
      .applyQueryParams(this.request.query, options)
      .paginate();
    // .execute();

    return res;
  }

  async create(payload) {
    const res = await new Model()
      .insert(this.request.params.resources, payload)
      .execute();

    return res;
  }

  async bulkCreate(payload) {
    const res = await new Model()
      .bulkInsert(this.request.params.resources, payload)
      .execute();

    return res;
  }
}

module.exports = BaseService;

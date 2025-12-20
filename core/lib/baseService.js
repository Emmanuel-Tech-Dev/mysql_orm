const utils = require("../../shared/utils/functions");

const Model = require("../model/model");

class BaseService {
  constructor(request, response) {
    this.request = request;
    this.response = response;
  }

  async findAll() {
    const { resources } = this.request.params;
    const res = await new Model().select(["*"], resources).paginate(1, 10);
    // console.log(res);
    const data = utils.removePasswordFromObject(res);

    return data;
  }

  async findAllWithParams(options = {}) {
    // console.log(options);
    const { resources } = this.request.params;

    const { paginate } = options;

    const res = await new Model()
      .select(["*"], resources)
      .applyQueryParams(this.request.query, options)
      .paginate(paginate?.page, paginate?.limit);
    // .execute();

    return res;
  }

  async findOne(payload) {
    const res = await new Model()
      .select(["*"], payload?.resources)
      .where("id", "=", payload?.id)
      .execute();
    return res[0];
  }

  async create(payload) {
    const { resources } = this.request.params;
    const res = await new Model().insert(resources, payload).execute();

    return res;
  }

  async bulkCreate(payload) {
    const { resources } = this.request.params;
    const res = await new Model().bulkInsert(resources, payload).execute();

    return res;
  }

  async updateRecord(payload) {
    const { resources, id } = this.request.params;
    const res = await new Model()
      .update(resources, payload)
      .where("id", "=", id)
      .execute();

    return res;
  }

  async deleteRecord(payload) {
    const res = await new Model()
      .delete(payload?.resources)
      .where("id", "=", payload?.id)
      .execute();

    return res;
  }
}

module.exports = BaseService;

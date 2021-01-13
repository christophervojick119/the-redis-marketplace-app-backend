const { expect } = require("chai");
const supertest = require("supertest");

const app = require("../app");
const { validateInput, joiSchemas } = require("../../validation");

const { joiObjectRequired, joiStringRequired, joiArrayNullable } = joiSchemas;

describe("GET /projects", () => {
  const request = supertest(app);
  const path = "/projects";

  it("should return 200 and filter results based on text_filter", async () => {
    const { body } = await request
      .get(path)
      .query({ text_filter: "Dummy" })
      .expect(200);

    const bodySchema = joiArrayNullable([
      joiObjectRequired({
        app_name: joiStringRequired.regex(/Dummy/),
      }).unknown(),
    ]);

    await validateInput(body.rows, bodySchema);
  });

  it("should return 200 and filter results based on tags", async () => {
    const language = ["Javascript", "Python"];
    // eslint-disable-next-line camelcase
    const redis_commands = "FT.SEARCH";

    const { body } = await request
      .get(path)
      .query({ language, redis_commands })
      .expect(200);

    const bodySchema = joiArrayNullable([
      joiObjectRequired({
        language: joiArrayNullable([
          joiStringRequired.regex(/Javascript|Python/),
        ]),
        redis_commands: joiArrayNullable([
          joiStringRequired.regex(/FT.SEARCH/),
        ]),
      }).unknown(),
    ]);

    await validateInput(body.rows, bodySchema, {
      stripUnknown: { arrays: true },
    });
  });

  it("should return 200 and limit results", async () => {
    const limit = 1;

    const { body } = await request.get(path).query({ limit }).expect(200);

    expect(body.rows.length).to.eql(1);
  });

  it("should return 200 and empty array on incorrect filters", async () => {
    const language = "Fortran";

    const { body } = await request.get(path).query({ language }).expect(200);

    expect(body.rows).to.eql([]);
  });
});

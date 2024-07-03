const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  let projectId;

  test("Create an issue with every field", function (done) {
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Test Issue #1",
        issue_text: "Test issue with every field filled",
        created_by: "Bs13",
        assigned_to: "Vasya Pupkin",
        status_text: "Test status",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "issue_title");
        assert.property(res.body, "issue_text");
        assert.property(res.body, "created_by");
        assert.property(res.body, "assigned_to");
        assert.property(res.body, "status_text");
        assert.property(res.body, "_id");
        assert.property(res.body, "created_on");
        assert.property(res.body, "updated_on");
        assert.property(res.body, "open");
        projectId = res.body._id; // saving id in projectId variable
        done();
      });
  });

  test("Create an issue with only required fields", function (done) {
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Test Issue #2",
        issue_text: "Issue with only required fields",
        created_by: "Bs13",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "issue_title");
        assert.property(res.body, "issue_text");
        assert.property(res.body, "created_by");
        assert.property(res.body, "_id");
        assert.property(res.body, "created_on");
        assert.property(res.body, "updated_on");
        assert.property(res.body, "open");
        done();
      });
  });

  test("Create an issue with missing required fields", function (done) {
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Test Issue #3",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });

  test("View issues on a project", function (done) {
    chai
      .request(server)
      .get("/api/issues/test")
      .query({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test("View issues on a project with one filter", function (done) {
    chai
      .request(server)
      .get("/api/issues/test")
      // requesting only opened issues
      .query({ open: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test("View issues on a project with multiple filters", function (done) {
    chai
      .request(server)
      .get("/api/issues/test")
      // requesting only opened issues and assigned to Vasya Pupkin
      .query({ open: true, assigned_to: "Vasya Pupkin" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test("Update one field on an issue", function (done) {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({
        _id: projectId,
        issue_title: "Updated Title",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "result");
        assert.equal(res.body.result, "successfully updated");
        assert.property(res.body, "_id");
        done();
      });
  });

  test("Update multiple fields on an issue", function (done) {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({
        _id: projectId,
        issue_text: "Updated Title",
        assigned_to: "Petya Zalupkin",
        status_text: "Closed",
        open: false,
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "result");
        assert.equal(res.body.result, "successfully updated");
        assert.property(res.body, "_id");
        done();
      });
  });

  test("Update an issue with missing _id", function (done) {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({
        issue_title: "Updated Title",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });

  test("Update an issue with no fields to update", function (done) {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({
        _id: projectId,
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "no update field(s) sent");
        assert.property(res.body, "_id");
        done();
      });
  });

  // Test: Update an issue with an invalid _id
  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({
        _id: "id-that-doesnt-exist",
        issue_title: "Updated Title",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "could not update");
        assert.property(res.body, "_id");
        done();
      });
  });

  test("Delete an issue", function (done) {
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({
        _id: projectId,
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "result");
        assert.equal(res.body.result, "successfully deleted");
        assert.property(res.body, "_id");
        done();
      });
  });

  test("Delete an issue with an invalid _id", function (done) {
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({
        _id: "id-that-doesnt-exist",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "could not delete");
        assert.property(res.body, "_id");
        done();
      });
  });

  test("Delete an issue with missing _id", function (done) {
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
});

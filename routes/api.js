//Create unique id for each issue
const { v4: uuidv4 } = require("uuid");

// Issues are in memory, no database is used
let projects = {};

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      const project = req.params.project;
      const queryParams = req.query;

      let issues = projects[project] || [];

      // Filter by query parameters if provided
      if (Object.keys(queryParams).length > 0) {
        issues = issues.filter((issue) => {
          for (let key in queryParams) {
            if (queryParams[key] !== String(issue[key])) {
              return false;
            }
          }
          return true;
        });
      }

      res.json(issues);
    })

    .post(function (req, res) {
      const project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to = "",
        status_text = "",
      } = req.body;

      // No required fields error handler
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }

      // Create new issue
      const newIssue = {
        _id: uuidv4(),
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        open: true,
      };

      if (!projects[project]) {
        projects[project] = [];
      }
      projects[project].push(newIssue);
      res.json(newIssue);
    })

    .put(function (req, res) {
      const project = req.params.project;
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;

      // No ID error handler
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }

      // No update fields error handler
      if (
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text &&
        !open
      ) {
        res.json({ error: "no update field(s) sent", _id: _id });
        return;
      }

      // Find the issue by _id
      try {
        const issueToUpdate = (projects[project] || []).find(
          (issue) => issue._id === _id,
        );
        // Project not found error handler
        if (!issueToUpdate) {
          throw new Error("project not found");
        }

        // Update fields
        if (issue_title) {
          issueToUpdate.issue_title = issue_title;
        }
        if (issue_text) {
          issueToUpdate.issue_text = issue_text;
        }
        if (created_by) {
          issueToUpdate.created_by = created_by;
        }
        if (assigned_to !== undefined) {
          issueToUpdate.assigned_to = assigned_to;
        }
        if (status_text !== undefined) {
          issueToUpdate.status_text = status_text;
        }
        if (open !== undefined) {
          issueToUpdate.open = open === true || open === "true";
        }
        // Updateing timestamp
        issueToUpdate.updated_on = new Date().toISOString();

        res.json({ result: "successfully updated", _id: _id });
      } catch (err) {
        //could not update error handler
        res.json({ error: "could not update", _id: _id });
      }
    })

    .delete(function (req, res) {
      const project = req.params.project;
      const { _id } = req.body;

      // Missing id on delete error handler
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }

      // Find index of issue to delete
      const index = (projects[project] || []).findIndex(
        (issue) => issue._id === _id,
      );
      if (index === -1) {
        //Issue not found on delete error handler
        res.json({ error: "could not delete", _id: _id });
        return;
      }

      // Remove issue from array
      projects[project].splice(index, 1);

      res.json({ result: "successfully deleted", _id: _id });
    });
};

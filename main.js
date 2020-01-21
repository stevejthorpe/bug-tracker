const express = require("express");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const app = express();
const db = require("./utils/db");
const helmet = require("helmet");
const csurf = require("csurf");
const chance = require("chance");
const hb = require("express-handlebars");

const { Client } = require("pg");
const client = new Client();

const moment = require("moment");

let secrets;
if (process.env.NODE_ENV == "production") {
  secrets = process.env; // in prod the secrets are environment variables
} else {
  secrets = require("./secrets/secrets"); // in dev they are in secrets.json which is listed in .gitignore
}

// AUTH
// const passport = require("passport");
// var GitHubStrategy = require("passport-github").Strategy;

// passport.use(
//   new GithubStrategy(
//     {
//       clientID: "secrets.clientID",
//       clientSecret: "secrets.clientSecret",
//       callbackURL: "http://localhost:8080/auth/github/callback"
//     },
//     function(accessToken, refreshToken, profile, done) {
//       return done(null, profile);
//     }
//   )
// );

// app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser(function(user, done) {
//   // placeholder for custom user serialization
//   // null is for errors
//   done(null, user);
// });

// passport.deserializeUser(function(user, done) {
//   // placeholder for custom user deserialization.
//   // maybe you are going to get the user from mongo by id?
//   // null is for errors
//   done(null, user);
// });

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
////////////////
// Middleware //
////////////////
// app.use(express.json());
app.use(express.static("./public"));
app.use(express.static("./utils"));
app.use(express.static("./secrets"));

app.use(
  express.urlencoded({
    extended: false
  })
);

// COOKIE SESSION //

app.use(
  cookieSession({
    secret: "I'm always angry.",
    maxAge: 1000 * 60 * 60 * 24 * 14
  })
);

// app.use(cookieParser());

// SECURITY //
app.use(helmet());

app.use(csurf());

app.use(function(req, res, next) {
  res.cookie("mytoken", req.csrfToken());
  next();
});

////////////
// Routes //
////////////

app.get("/", function(req, res) {
  res.render("tracker", {
    layout: "main"
  });

  // // dump the user for debugging
  // if (req.isAuthenticated()) {
  //   html += "<p>authenticated as user:</p>";
  //   html += "<pre>" + JSON.stringify(req.user, null, 4) + "</pre>";
  // }
});

// // we will call this to start the GitHub Login process
// app.get("/auth/github", passport.authenticate("github"));

// // GitHub will call this URL
// app.get(
//   "/auth/github/callback",
//   passport.authenticate("github", { failureRedirect: "/" }),
//   function(req, res) {
//     res.redirect("/");
//   }
// );

app.get("/logout", function(req, res) {
  console.log("logging out");
  req.logout();
  res.redirect("/");
});

///////////////////

function fetchIssues() {
  // Retrieve issues from Local Storage
  var issues = JSON.parse(localStorage.getItem("issues"));
  // Retrieve reference to the <div> element with id issuesList.
  var issuesList = document.getElementById("issuesList");

  issuesList.innerHTML = "";

  // Loop  over the elements in issues
  for (var i = 0; i < issues.length; i++) {
    var id = issues[i].id;
    var desc = issues[i].description;
    var severity = issues[i].severity;
    var assignedTo = issues[i].assignedTo;
    var status = issues[i].status;

    issuesList.innerHTML +=
      '<div class="well">' +
      "<h6>Issue ID: " +
      id +
      "</h6>" +
      '<p><span class="label label-info">' +
      status +
      "</span></p>" +
      "<h3>" +
      desc +
      "</h3>" +
      '<p><span class="glyphicon glyphicon-time"></span> ' +
      severity +
      " " +
      '<span class="glyphicon glyphicon-user"></span> ' +
      assignedTo +
      "</p>" +
      '<a href="#" class="btn btn-warning" onclick="setStatusClosed(\'' +
      id +
      "')\">Close</a> " +
      '<a href="#" class="btn btn-danger" onclick="deleteIssue(\'' +
      id +
      "')\">Delete</a>" +
      "</div>";
  }
}

// document.getElementById("issueInputForm").addEventListener("submit", saveIssue);

function saveIssue(e) {
  var issueId = chance.guid();
  var issueDesc = document.getElementById("issueDescInput").value;
  var issueSeverity = document.getElementById("issueSeverityInput").value;
  var issueAssignedTo = document.getElementById("issueAssignedToInput").value;
  var issueStatus = "Open";

  var issue = {
    id: issueId,
    description: issueDesc,
    severity: issueSeverity,
    assignedTo: issueAssignedTo,
    status: issueStatus
  };

  if (localStorage.getItem("issues") === null) {
    var issues = [];
    issues.push(issue);
    localStorage.setItem("issues", JSON.stringify(issues));
  } else {
    var issues = JSON.parse(localStorage.getItem("issues"));
    issues.push(issue);
    localStorage.setItem("issues", JSON.stringify(issues));
  }

  document.getElementById("issueInputForm").reset();

  fetchIssues();

  e.preventDefault();
}

function setStatusClosed(id) {
  var issues = JSON.parse(localStorage.getItem("issues"));

  for (var i = 0; i < issues.length; i++) {
    if (issues[i].id == id) {
      issues[i].status = "Closed";
    }
  }

  localStorage.setItem("issues", JSON.stringify(issues));

  fetchIssues();
}

function deleteIssue(id) {
  var issues = JSON.parse(localStorage.getItem("issues"));

  for (var i = 0; i < issues.length; i++) {
    if (issues[i].id == id) {
      issues.splice(i, 1);
    }
  }

  localStorage.setItem("issues", JSON.stringify(issues));

  fetchIssues();
}

app.listen(process.env.NODE_ENV || 8080, () => console.log("Running!!!!"));

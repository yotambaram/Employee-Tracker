const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3000,
  user: "root",
  password: "password",
  database: "employee_tracker_DB"
});


// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  console.log('eee')
  // run the start function after the connection is made to prompt the user
  //start();
});


// function which prompts the user for what action they should take
function start() {
  // witch one
  inquirer
    .prompt({
      type: "list",
      choices: ["Add Data", "View Data", "Update Data", "I'm Done, Take me out"],
      message: "What Do you want to do??",
      name: "view_dep"
    })
    .then(function (answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.view_dep === "Add Data") {
        console.log("Add Data")
        addData()
      } else if (answer.view_dep === "View Data") {
        chooseViewData()
      } else if (answer.view_dep === "Update Data") {
        console.log("Update Data")
      } else {
        connection.end();
      }
    });
}

// ************** ADD DATA **************

function addData() {
  // witch one
  inquirer
    .prompt({
      type: "list",
      choices: ["Add department", "Add roles", "Add employees"],
      message: "Witch Data Do you want to add?",
      name: "add_data"
    })
    .then(function (answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.add_data === "Add department") {
        addDepartment()
      } else if (answer.add_data === "Add role") {
        addRoles()
      } else if (answer.add_data === "Add employee") {
        addEmployee()
      } else {
        connection.end();
      }
    });
}


function addDepartment() {
  inquirer.prompt({
    type: "input",
    message: "Enter name of new department",
    name: "add_department"
  }).then(function (answer) {
    connection.query("INSERT INTO department ?", {name: answer.add_department}
    , function(err, results) {
      if (err) throw err;
    })
  })
}

function addRoles() {
  inquirer
    .prompt(
      {
        type: "input",
        message: "Enter new title",
        name: "add_title"
      },
      {
        type: "input",
        message: "Enter new salary",
        name: "add_salary"
      },
      // NEED to add department id
    ).then(function (answer) {
      connection.query("INSERT INTO role ?",
      {
        title: answer.add_title,
        salary: answer.salary,
      }
      , function(err, results) {
        if (err) throw err;
      })
    })
  }

  function addEmployee() {
    inquirer
      .prompt(
        {
          type: "input",
          message: "Enter new employee first name",
          name: "first_name"
        },
        {
          type: "input",
          message: "Enter new employee first name",
          name: "last_name"
        },
        // NEED to add role id
        // NEED add manager id
      ).then(function (answer) {
        connection.query("INSERT INTO employee ?",
        {
          first_name: answer.first_name,
          last_name: answer.last_name,
        }
        , function(err, results) {
          if (err) throw err;
        })
      })
    }


  // ************** VIEW DATA **************
  function chooseViewData() {
    // witch one
    inquirer
      .prompt({
        type: "list",
        choices: ["View department", "View roles", "View employees"],
        message: "Witch Data Do you want to add?",
        name: "add_data"
      })
      .then(function (answer) {
        // based on their answer, either call the bid or the post functions
        if (answer.add_data === "View department") {
          viewDepartment()
        } else if (answer.add_data === "View roles") {
          viewData(roles)
        } else if (answer.add_data === "View employees") {
          viewData(employees)
        } else {
          connection.end();
        }
      });
  }
  
  
  function viewDepartment() {
    var query = "SELECT * FROM department INNER JOIN top5000 ON (top_albums.artist = top5000.artist AND top_albums.year ";
    query += "= top5000.year) WHERE (top_albums.artist = ? AND top5000.artist = ?) ORDER BY top_albums.year, top_albums.position";

      connection.query("VIEW * department", function(err, results) {
        if (err) throw err;
      })
  }
  
  function addRole() {
    inquirer
      .prompt(
        {
          type: "input",
          message: "Enter new title",
          name: "add_title"
        },
        {
          type: "input",
          message: "Enter new salary",
          name: "add_salary"
        },
        // NEED to add department id
      ).then(function (answer) {
        connection.query("INSERT INTO role ?",
        {
          title: answer.add_title,
          salary: answer.salary,
        }
        , function(err, results) {
          if (err) throw err;
        })
      })
    }
  
    function addEmployee() {
      inquirer
        .prompt(
          {
            type: "input",
            message: "Enter new employee first name",
            name: "first_name"
          },
          {
            type: "input",
            message: "Enter new employee first name",
            name: "last_name"
          },
          // NEED to add role id
          // NEED add manager id
        ).then(function (answer) {
          connection.query("INSERT INTO employee ?",
          {
            first_name: answer.first_name,
            last_name: answer.last_name,
          }
          , function(err, results) {
            if (err) throw err;
          })
        })
      }
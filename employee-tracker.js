const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "employee_tracker_db"
});

connection.connect(function (err) {
  if (err) throw err;
  start();
  //getTitlesArr()
});


// ask the user what he wants to do
function start() {
  inquirer
    .prompt({
      type: "list",
      choices: ["Add Data", "View Data", "Update Data", "I'm Done, Take me out"],
      message: "What Do you want to do??",
      name: "view_dep"
    })
    .then(function (answer) {
      if (answer.view_dep === "Add Data") {
        addData()
      } else if (answer.view_dep === "View Data") {
        chooseViewData()
      } else if (answer.view_dep === "Update Data") {
        UpdateData()
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
      choices: ["Add department", "Add role title", "Add employee"],
      message: "Witch Data Do you want to add?",
      name: "add_data"
    })
    .then(function (answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.add_data === "Add department") {
        addDepartment()
      } else if (answer.add_data === "Add role title") {
        addRole()
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
    let newDepartment = answer.add_department
    connection.query("INSERT INTO department SET ?", { name: newDepartment}
      , function (err, results) {
        if (err) throw err;
        console.log(`${newDepartment} add to departments`)
        start()
      })
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
      // NEED to add department id
    ).then(function (answer) {
      let newTitle = answer.add_title
      connection.query("INSERT INTO role SET ?",{title: newTitle}
        , function (err, results) {
          if (err) throw err;
          console.log(`${newTitle} add to titles`)
          start()
        })
        
    })
}



function addEmployee() {
  let departmentArr = getDepartmentArr()
  let titlesArr = getTitlesArr()
  inquirer
    .prompt([
      {
      type: "input",
      message: "Enter new employee first name",
      name: "firstname"
      },
      {
        type: "input",
        message: "Enter new employee last name",
        name: "lastname"
      },
      {
        type: "list",
        choices: titlesArr,
        message: "choose title",
        name: "title"
      },
      {
        type: "input",
        message: "Enter new employee salary",
        name: "salary"
      },
      {
        type: "list",
        choices: departmentArr,
        message: "choose department",
        name: "department"
      }
    ]).then(function (answer) {
      console.log("answer: "+answer)
      connection.query(
        ("INSERT INTO department SET ?",
        {
         name: answer.department,
        }
        , function (err, results) {
          if (err) throw err;
        }),
        ("INSERT INTO role SET ?",
        {
         title: answer.title,
         salary: answer.salary
        }
        , function (err, results) {
          if (err) throw err;
        }),
        "INSERT INTO employee SET ?",
        {
         first_name: answer.firstname,
         last_name: answer.lastname,
        }
        , function (err, results) {
          if (err) throw err;
        })
        console.log(`${answer.firstname} added to employees data`)
        //connection.end();
        start()
    })
}

// get departments array
function getDepartmentArr(){
  let employeesArr = [];
  connection.query("SELECT name FROM department", function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      let e = res[i].name;
      employeesArr.push(e);
      //console.log(employeesArr)
    }
  });
  return employeesArr
}

// get titles array
function getTitlesArr(){
  let titleArr = [];
  connection.query("SELECT title FROM role", function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      let e = res[i].title;
      titleArr.push(e);
    }
  });
  return titleArr
}


  // ************** VIEW DATA **************
  function chooseViewData() {
    // witch one
    inquirer
      .prompt({
        type: "list",
        choices: ["View department", "View role", "View employee"],
        message: "Witch Data Do you want to view?",
        name: "view_data"
      })
      .then(function (answer) {
        if (answer.view_data === "View department") {
          viewDepartment()
        } else if (answer.add_data === "View role") {
          viewRole()
        } else if (answer.add_data === "View employee") {
          viewEmployee()
        } else {
          connection.end();
        }
      });
  }


  function viewDepartment() {
    connection.query("SELECT * FROM department", function (err, results) {
      if (err) throw err;
    })
  }

  function viewRole() {
    var query = "SELECT department.id FROM department INNER JOIN role ON (role.department_id = department_id";
    connection.query(query, function (err, results) {
      if (err) throw err;
    })
  }

  function viewEmployee() {
    var query = "SELECT role.id, manager.id FROM role INNER JOIN employee ON (employee.department_id = department_id";
    connection.query(query, function (err, results) {
      if (err) throw err;
    })
  }


  // ************** UPDATE DATA **************

  function UpdateData() {
    var query = "UPDATE employee.id, employee.first_name FROM top5000 GROUP BY artist HAVING count(*) > 1";
    //UPDATE EMPLOYEE ROLES
    // select employee to get his role
    // update his role
    inquirer
      .prompt({
        type: "list",
        choices: ["Add department", "Add role", "Add employee"],
        message: "Witch Data Do you want to add?",
        name: "add_data"
      })
      .then(function (answer) {
        // based on their answer, either call the bid or the post functions
        if (answer.add_data === "Add department") {
          addDepartment()
        } else if (answer.add_data === "Add role") {
          addRole()
        } else if (answer.add_data === "Add employee") {
          addEmployee()
        } else {
          connection.end();
        }
      });
  }


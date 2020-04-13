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
});

let newEmployeeArr = [];

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
// choose witch data do you want to add
function addData() {
  // witch one
  inquirer
    .prompt({
      type: "list",
      choices: ["Add department", "Add role", "Add employee", "Back to menu"],
      message: "Witch Data Do you want to add?",
      name: "add_data"
    })
    .then(function (answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.add_data === "Add department") {
        addNewDepartment();
      } else if (answer.add_data === "Add role") {
        addNewRole();
      } else if (answer.add_data === "Add employee") {
        addNewEmployeeName();
      } else if (answer.add_data === "Back to menu") {
        start();
      } else {
        connection.end();
      }
    });
}

////////////////////
// add new department
function addNewDepartment() {
  inquirer.prompt({
    type: "input",
    message: "Enter name of new department",
    name: "add_department"
  }).then(function (answer) {
    let newDepartment = answer.add_department
    connection.query("INSERT INTO department SET ?", { name: newDepartment}
      , function (err, results) {
        if (err) throw err;
        console.log(`*****${newDepartment} added to department data *****`)
        start()
      })
  })
}

////////////////////
// add new role
function addNewRole() {
  let departmentsList = getDepartmentsArr()
  let newRole = []
  inquirer
    .prompt([
      {
        type: "input",
        message: "Enter new role",
        name: "title",
      },
      {
        type: "input",
        message: "Enter new role salary",
        name: "salary",
      },
      {
        type: "list",
        choices: departmentsList,
        message: "Choose the roles department",
        name: "department",
      }
    ]).then(function (answer) {
      let query = `SELECT department_id FROM department WHERE department.name = 'support'`
      connection.query(query, function (err, res) {
          CreateNewRoleDB(answer.title, answer.salary, res[0].department_id);
        })
    })
}

function CreateNewRoleDB(newTitle, newSalary, departmentID){
  connection.query("INSERT INTO role SET ?",
        {
          title: newTitle,
          salary: newSalary,
          department_id: departmentID
        }
        , function (err, results) {
        if (err) throw err;
        console.log(`***** ${newTitle} added to role data *****`);
        start()
      });
}


////////////////////
// add new employee

//add full name
function addNewEmployeeName() {
  let titlesArr = getTitlesArr()
  newEmployeeArr = []
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
      }
      ]).then(answer=> {
        newEmployeeArr.push(answer.firstname, answer.lastname)
        addEmployeeRoll(titlesArr)
      })      
}

// choose role
function addEmployeeRoll(titles) {
  let managerArr = getManagerArr()
  inquirer
    .prompt([
      {
        type: "list",
        choices: titles,
        message: "What is the new employee role?",
        name: "roletitle"
      }
      ]).then(answer=> {
        let query = `SELECT role_id FROM role WHERE title = '${answer.roletitle}';`
        connection.query(query, function (err, res) {
          if (err) throw err;
          newEmployeeArr.push(res[0].role_id);
          getManagerID(managerArr);
      })
    })
}

// choose manager
function getManagerID(managers){
  inquirer
    .prompt([
      {
        type: "list",
        choices: managers,
        message: "Who is the new employee manager?",
        name: "manager"
      }
    ]).then(answer=> {
      //  possible to set all names to small letters (end case)
      let managerName = answer.manager.split(" ")
      let query = `SELECT employee_id FROM employee WHERE first_name = '${managerName[0]}' AND employee.last_name = '${managerName[1]}';`
      connection.query(query, function (err, res) {
        if (err) throw err;
        let managerID = res[0].employee_id;
        newEmployeeArr.push(managerID);
        CreateNewEmployeeDB();
    })
  })
}

// set the new employee in db
function CreateNewEmployeeDB(){
  connection.query("INSERT INTO employee SET ?",
        {
          first_name: newEmployeeArr[0],
          last_name: newEmployeeArr[1],
          role_id: newEmployeeArr[2],
          manager_id: newEmployeeArr[3]
        }
        , function (err, results) {
        if (err) throw err;
        console.log(`***** ${newEmployeeArr[0]}dded to employee data *****`);
        start()
      });
}

//possible to make array builder function with diffirent querys
// get managers array
function getManagerArr(){
  const namesArr = [];
  let query = "SELECT * FROM (employee INNER JOIN role ON (employee.role_id = role.role_id)) WHERE (role.title = 'manager')";
  connection.query(query, function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
    e = res[i].first_name + " " + res[i].last_name;
    namesArr.push(e)
    }
  });
  return namesArr;
}


// get roles array
function getTitlesArr(){
  let titleArr = [];
  connection.query("SELECT title FROM role", function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      let e = res[i].title;
      titleArr.push(e);
    }
  });
  return titleArr;
}

// get department array
function getDepartmentsArr(){
  let departmentArr = [];
  connection.query("SELECT name FROM department", function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      let e = res[i].name;
      departmentArr.push(e);
    }
  });
  return departmentArr;
}

// ************** VIEW DATA **************
function chooseViewData() {
  // choose data to view
  inquirer
    .prompt({
      type: "list",
      choices: ["View department", "View role", "View employee", "Back to menu"],
      message: "Witch Data Do you want to view?",
      name: "view_data"
    })
    .then(function (answer) {
      if (answer.view_data === "View department") {
        viewDepartment()
      } else if (answer.view_data === "View role") {
        viewRole()
      } else if (answer.view_data === "View employee") {
        viewEmployee()
      } else if (answer.view_data === "Back to menu") {
        start()
      } else {
        connection.end();
      }
    });
}


  function viewDepartment() {
    let query = "SELECT * FROM department";
    connection.query(query, function (err, results) {
      if (err) throw err;
      console.table(results)
      start()
    })
  }

  function viewRole() {
    let query = "SELECT * FROM role";
    connection.query(query, function (err, results) {
      if (err) throw err;
      console.table(results)
      start()
    })
  }



  function viewEmployee() {
    let query = "SELECT * FROM employee";
    connection.query(query, function (err, results) {
      if (err) throw err;
      console.table(results)
      start()
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


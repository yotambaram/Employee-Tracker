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
function start(){
  inquirer
    .prompt({
      type: "list",
      choices: ["Add Employee Data", "View Employee Data", "Update Employee Data", "I'm done, take me out"],
      message: "What Do you want to do??",
      name: "view_dep"
    })
    .then(function (answer) {
      if (answer.view_dep === "Add Employee Data") {
        addData()
      } else if (answer.view_dep === "View Employee Data") {
        chooseViewData()
      } else if (answer.view_dep === "Update Employee Data") {
        UpdateData()
      } else if (answer.view_dep === "I'm done, take me out") {
        connection.end();
      } else {
        connection.end();
      }
    });
}



// ************** ADD DATA **************
// choose witch data do you want to add
function addData(){
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
// ADD NEW DEPARTMENT
function addNewDepartment(){
  inquirer.prompt({
    type: "input",
    message: "Enter name of new department",
    name: "add_department"
  }).then(function (answer) {
    let newDepartment = answer.add_department
    connection.query("INSERT INTO department SET ?", { name: newDepartment}
      , function (err, results) {
        if (err) throw err;
        console.log(`***** ${newDepartment} added to department data *****`)
        start()
      })
  })
}

////////////////////
// ADD NEW ROLE
//add new title, salary and choose department
async function addNewRole(){
  const ArrQuery = "SELECT * FROM department"
  let departmentsList = await getArr(ArrQuery, "name", 0);
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
      //get dep id
      let query = `SELECT department_id FROM department WHERE department.name = '${answer.department}'`
      connection.query(query, function (err, result) {
        if (err) throw err;
        const dep_ID = result[0].department_id;
        CreateNewRoleDB(answer.title, answer.salary, dep_ID);
      })
      
    })
}

// set the new role in db
function CreateNewRoleDB(newTitle, newSalary, departmentID){
  connection.query("INSERT INTO role SET ?",
        {
          title: newTitle,
          salary: newSalary,
          department_id: departmentID
        }
        , function (err, result) {
        if (err) throw err;
        console.log(`***** ${newTitle} added to role data *****`);
        start()
      });
}

////////////////////
// ADD NEW EMPLOYEE
//add full name
async function addNewEmployeeName(){
  const ArrQuery = "SELECT title FROM role"
  let titlesList = await getArr(ArrQuery, "title", 0)
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
      },
      {
        type: "list",
        choices: titlesList,
        message: "What is the new employee role?",
        name: "roletitle"
      }      
      ]).then(answer=> {
        let query = `SELECT role_id FROM role WHERE role.title = '${answer.roletitle}';`
        console.log(query)
        connection.query(query, function (err, res) {
          if (err) throw err;
          newEmployeeArr.push(answer.firstname, answer.lastname, res[0].role_id)
          console.log(newEmployeeArr)
          getManager();
        })
      })      
}

// choose manager
async function getManager(){
  let ArrQuery = "SELECT * FROM employee WHERE (role_id = '1')";
  let firstname = await getArr(ArrQuery, "first_name", "last_name")
  inquirer
    .prompt([
      {
        type: "list",
        choices: firstname,
        message: "Who is the new employee manager?",
        name: "manager"
      }
    ]).then(answer=> {
      //  possible to set all names to small letters (end case)
      
      managerName = answer.manager.split(' ');
      let query = `SELECT employee_id FROM employee WHERE first_name = '${managerName[0]}' AND last_name = '${managerName[1]}';`
      connection.query(query, function (err, res) {
        if (err) throw err;
        newEmployeeArr.push(res[0].employee_id);
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
        console.log(`***** ${newEmployeeArr[0]} added to employee data *****`);
        start()
      });
}

////////////////////
// GET DATA ARRAYS - possible to make array builder function with diffirent querys
// get data array

function getArr(query, col, col2){
  let genArr = [];
  return new Promise( (resolve, reject) => {
    connection.query(query, function (err, res) {
      if (err) throw err;
      if(col2 === 0){
        for (let i = 0; i < res.length; i++) {
          let e = res[i][col];
          genArr.push(e);
        }
      } else {
        for (let i = 0; i < res.length; i++) {
          let e = res[i][col] + " " + res[i][col2];
          genArr.push(e);
        }  
     };
   resolve(genArr)
  });
});
}



/* DELETE
function getEmployeeArr(){
  let employeeArr = [];
  return new Promise( (resolve, reject) => {
    connection.query("SELECT first_name FROM employee", function (err, res) {
      if (err) throw err;
      for (let i = 0; i < res.length; i++) {
        let e = res[i].first_name;
        employeeArr.push(e);
      }
      resolve(employeeArr)
   });
  })
}


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
*/




// ************** VIEW DATA **************
// choose witch data do you want to view
function chooseViewData(){
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

// get departments data
  function viewDepartment(){
    let query = "SELECT * FROM department";
    connection.query(query, function (err, results) {
      if (err) throw err;
      console.table(results)
      start()
    })
  }

// get role data
  function viewRole(){
    let query = "SELECT * FROM role";
    connection.query(query, function (err, results) {
      if (err) throw err;
      console.table(results)
      start()
    })
  }


  
  // get employee data
  function viewEmployee(){
    let query = "SELECT * FROM employee";
    connection.query(query, function (err, results) {
      if (err) throw err;
      console.table(results)
      start()
    })
  }




  // ************** UPDATE DATA **************
// choose witch data do you want to update

async function chooseEmployee(){
  const ArrQuery = "SELECT first_name, last_name FROM employee"
    let employeesList = await getArr(ArrQuery, "title", 0)
  inquirer
  .prompt({
    type: "list",
    choices: employeesList,
    message: "Witch employee data do you want to update?",
    name: "choose_employee"
  })
  .then(function (answer) {
   console.log(answer)
})
}



  function UpdateData(){
    inquirer
      .prompt({
        type: "list",
        choices: ["Update department", "Update role", "Update employee", "Back to main menu"],
        message: "Witch Data Do you want to update?",
        name: "add_data"
      })
      .then(function (answer) {
        if (answer.add_data === "Update employee manager"){
          updateEmployeeDepartment()
        } else if (answer.add_data === "Update employee role"){
          updateEmployeeRole()
        } else if (answer.add_data === "Update employee name"){
          updateEmployeeRole()
        } else if (answer.add_data === "Back to main menu"){
          start()
        } else {
          connection.end();
        }
      });
  }



  async function updateEmployeeDepartment() {
    const ArrQuery = "SELECT title FROM role"
    let titlesList = await getArr(ArrQuery, "title", 0)

  }
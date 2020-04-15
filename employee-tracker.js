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
      choices: ["Add Employee Data", "View Employee Data", "Update Data", "I'm done, take me out"],
      message: "What Do you want to do??",
      name: "view_dep"
    })
    .then(function (answer) {
      if (answer.view_dep === "Add Employee Data") {
        addData()
      } else if (answer.view_dep === "View Employee Data") {
        chooseViewData()
      } else if (answer.view_dep === "Update Data") {
        chooseEmployee()
      } else if (answer.view_dep === "I'm done, take me out") {
        connection.end();
      } else {
        connection.end();
      }
    });
}



// ************** ADD DATA **************
// choose Which data do you want to add
function addData(){
  inquirer
    .prompt({
      type: "list",
      choices: ["Add department", "Add role", "Add employee", "Back to menu"],
      message: "Which Data Do you want to add?",
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
  let menegers = await getArr(ArrQuery, "first_name", "last_name")
  menegers.push("Don't have a manager")
  inquirer
    .prompt([
      {
        type: "list",
        choices: menegers,
        message: "Who is the new employee manager?",
        name: "manager"
      }
    ]).then(answer=> {
      //  possible to set all names to small letters (end case)
      if(answer.manager === "Don't have a manager") {
        newEmployeeArr.push(null);
      } else {
        managerName = answer.manager.split(' ');
        let query = `SELECT employee_id FROM employee WHERE first_name = '${managerName[0]}' AND last_name = '${managerName[1]}';`
        connection.query(query, function (err, res) {
          if (err) throw err;
          newEmployeeArr.push(res[0].employee_id);
         
        })
        
      }
      CreateNewEmployeeDB();  
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


// ************** VIEW DATA **************
// choose Which data do you want to view
function chooseViewData(){
  // choose data to view
  inquirer
    .prompt({
      type: "list",
      choices: ["View department", "View role", "View employee", "Back to menu"],
      message: "Which Data Do you want to view?",
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
// choose Which data do you want to update

async function chooseEmployee(){
  const ArrQuery = "SELECT first_name, last_name FROM employee"
    let employeesList = await getArr(ArrQuery, "first_name", "last_name")
  inquirer
  .prompt({
    type: "list",
    choices: employeesList,
    message: "Which employee data do you want to update?",
    name: "choose_employee"
  })
  .then(function (answer) {
    let updateEmployee = answer.choose_employee
    UpdateData(updateEmployee)
})
}



  function UpdateData(employee){
    inquirer
      .prompt({
        type: "list",
        choices: ["Update " + employee +"s manager",  "Update " + employee +"s role", "Update " + employee +"s name", "Back to main menu"],
        message: "Which Data Do you want to update?",
        name: "add_data"
      })
      .then(function (answer) {
        if (answer.add_data === "Update " + employee +"s manager"){
          updateEmployeemanager(employee)

        } else if (answer.add_data === "Update " + employee +"s role"){
          updateEmployeeRole(employee)

        } else if (answer.add_data === "Update " + employee +"s name"){
          updateEmployeeName(employee)

        } else if (answer.add_data === "Back to main menu"){
          start()
        } else {
          connection.end();
        }
      });
  }



  async function updateEmployeeRole(employee) {
    employeeName = employee.split(' ');
    let ArrQuery = "SELECT role.title FROM role"
    const roleList = await getArr(ArrQuery, "title", 0)
    inquirer
      .prompt([
        {
        type: "list",
        choices: roleList,
        message: "Which Data Do you want to update?",
        name: "add_data"
        }
      ]).then(function (answer) {
        let query = `SELECT role_id FROM role WHERE title = '${answer.add_data}';`
        connection.query(query, function(err, result){
          if (err) throw err;
          let updateQuery = `UPDATE employee SET role_id = '${result[0].role_id}' WHERE first_name = '${employeeName[0]}' AND last_name = '${employeeName[1]}';`
          UpdateDB(updateQuery)
        })  
      })
  }


  async function updateEmployeemanager(employee) {
    employeeName = employee.split(' ');
    console.log(employeeName)
    let ArrQuery = "SELECT first_name, last_name FROM employee WHERE role_id = 1"
    const managerList = await getArr(ArrQuery, "first_name", "last_name")
    inquirer
      .prompt([
        {
        type: "list",
        choices: managerList,
        message: "Which Data Do you want to update?",
        name: "manager"
        }
      ]).then(function (answer) {
        managerArr = answer.manager.split(' ');
        console.log(employeeName)
        let query = `SELECT employee_id FROM employee WHERE first_name = '${managerArr[0]}' AND last_name = '${managerArr[1]}';`
        connection.query(query, function(err, result){
          if (err) throw err;
          console.log(result)
          let updateQuery = `UPDATE employee SET manager_id = '${result[0].employee_id}' WHERE first_name = '${employeeName[0]}' AND last_name = '${employeeName[1]}';`
          UpdateDB(updateQuery)
        })  
      })
  }


  function updateEmployeeName(employee) {
    employeeName = employee.split(' ');
    inquirer
      .prompt([
        {
        type: "list",
        choices: ["First name", "Last name"],
        message: "Which Data Do you want to update?",
        name: "update_name"
       },
       {
        type: "input",
        message: "Enter new name",
        name: "new_name"
      }
      ]).then(function (answer) {
        if(answer.update_name === "First name"){
          const updatFirst = `UPDATE employee SET first_name = '${answer.new_name}' WHERE first_name = '${employeeName[0]}' AND last_name = '${employeeName[1]}';`
          UpdateDB(updatFirst)
        } else {
          const updatLast = `UPDATE employee SET last_name = '${answer.new_name}' WHERE first_name = '${employeeName[0]}' AND last_name = '${employeeName[1]}';`
          UpdateDB(updatLast)

        }
  })
}



  //update database
  function UpdateDB(query) {
    connection.query(query, function(err, result){
      if (err) throw err;
      start()
   })
  }






  


  

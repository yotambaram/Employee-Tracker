DROP DATABASE IF EXISTS employee_tracker_DB;
CREATE DATABASE employee_tracker_DB;

USE employee_tracker_DB;


CREATE TABLE department(
  depid INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY (depid)
);

CREATE TABLE role(
  roleid INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL (30,2),
  departmentid INT,
  FOREIGN KEY (departmentid) REFERENCES department(depid),
  PRIMARY KEY (roleid)
);

CREATE TABLE employee(
  empid INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT,
  manager_id INT,
  FOREIGN KEY (role_id) REFERENCES role(roleid),
  FOREIGN KEY (manager) REFERENCES role(roleid),
  PRIMARY KEY (empid)
);



INSERT INTO employee (first_name, last_name)
VALUES ("test-first-name", "test-last-name"),("test-first-name2", "test-last-name3");

INSERT INTO role (title, salary)
VALUES ("manager", 10.3),("engineer", 8.5);

INSERT INTO department (name)
VALUES ("support"),("sales"),("develop");




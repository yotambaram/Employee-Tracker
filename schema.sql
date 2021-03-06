--DROP DATABASE IF EXISTS employee_tracker_DB;
CREATE DATABASE employee_tracker_DB;

USE employee_tracker_DB;


CREATE TABLE department(
  department_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY (department_id)
);

CREATE TABLE role(
  role_id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL (30,2),
  department_id INT,
  FOREIGN KEY (department_id) REFERENCES department (department_id),
  PRIMARY KEY (role_id)
);

CREATE TABLE employee(
  employee_id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT,
  manager_id INT,
  FOREIGN KEY (role_id) REFERENCES role (role_id),
  FOREIGN KEY (manager_id) REFERENCES employee (employee_id),
  PRIMARY KEY (employee_id)
);


INSERT INTO department (name)
VALUES ("support"),("sales"),("development"),("HR");

INSERT INTO role (title, salary, department_id)
VALUES ("manager", 140, 3),("engineer", 120, 3),("intern engineer", 70, 3),("salesman", 90, 2),("intern salesman", 55, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Linda", "Smith", 1, null),("James", "Johnson", 2, 1),("Mary", "Brown", 2, 1),("William", "Miller", 3, 1);
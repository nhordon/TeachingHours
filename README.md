# Nagruzka
### The system was made for education department of college to distribute groups, classes, teaching hours according to departments, semesters, studying years, subjects and types of teaching (lecture, practice, lab, project, diploma, etc) to teachers. The project allows generate different kind of orders and teacher cards with hours of teaching subjects, types of teaching and group names for a year.
It uses Excel and Word templates for the generation. 
Technologies are Node.js, Express.js, EJS, Postgresql.

To run the system you have to:
1. Install Node.js and run it
2. Work with Postgresql server
- Install Postgresql server and run it
- Create database: db_name
- Create database user : db_user with password: db_pswd
	and grant the user permission to the database
- Create tables in the database by using file create_tables.sql
- Fill in table specialities.
3. Work with the system ‘nagruzka’
- Set up the environment in .env file in the main directory of project using
database setup information, default server localhost, default port 5432 
- From the main directory of project in terminal run command
npm start
- In any browser typing address localhost:3000
 and move according link to specialities.
- Using main menu you can move from one functionality to another.
- To stop working with the system to close browser and stop the system app by pressing in terminal Ctrl+C


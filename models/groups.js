const connection = require("../connection")
module.exports = {
    async insert(name, course,specid,dogovor, studentsdogovor,studentsbudget) {

        
        let result = await connection.query(`insert into groups
        (name, course,specid,dogovor, studentsdogovor,studentsbudget)
        values
        ($1, $2, $3, $4, $5, $6)`, [name, course,specid,dogovor, studentsdogovor,studentsbudget]);
        return result;
    },
    async obtain() {
        
        const result = await connection.query(`SELECT groups._id as _id, groups.name as name , course, specid, specialities.abr as abr, dogovor, studentsdogovor, studentsbudget
    FROM groups, specialities where specialities._id= groups.specid`);
   
        return result.rows;
    },
    async obtainGroupsId(id) {
        const result = await connection.query(`select * from groups where _id = $1`, [id]);
        return result.rows[0];
    },
    async obtainSpecAbr() {
        const result = await connection.query("select _id, abr from specialities");
        return result.rows;
    },
    async update(id, name, course,specid,dogovor, studentsdogovor,studentsbudget) {
        const result = connection.query(`update groups
        set name = $1,
        course = $2,
        specid = $3,
        dogovor = $4,
        studentsdogovor = $5,
        studentsbudget = $6
        where _id = $7`, [ name, course, specid, dogovor, studentsdogovor, studentsbudget, id]);
        return result;
    },
    async delete(id) {
        const result = connection.query(`delete from groups
        where _id = $1`, [id]);
        return result;
    },
}
const connection = require("../connection")
module.exports = {
    async insert(name, fullname, pckid, programs ) {

        
        let result = await connection.query(`insert into subjects
        (name, fullname, pckid, programs)
        values
        ($1, $2, $3, $4)`, [name, fullname, pckid, programs]);
        return result;
    },
    async obtain() {
         
        const result = await connection.query(`SELECT subjects._id as _id, subjects.name as name , 
        fullname,  pckid, pck.abr as abr, programs
        FROM subjects, pck where pck._id= subjects.pckid order by subjects.name`);
   
        return result.rows;
    },
    async obtainSubjectsId(id) {
        const result = await connection.query(`select * from subjects where _id = $1`, [id]);
        return result.rows[0];
    },
    async obtainPckAbr() {
        const result = await connection.query("select _id, abr from pck");
        return result.rows;
    },
    async update(id, name, fullname, pckid, programs) {
        const result = connection.query(`update subjects
        set name = $1,
        fullname = $2,
        pckid = $3,
        programs = $4
        where _id = $5`, [  name, fullname, pckid,  programs, id]);
        return result;
    },
    async delete(id) {
        const result = connection.query(`delete from subjects
        where _id = $1`, [id]);
        return result;
    },
}
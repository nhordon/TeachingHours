const connection = require("../connection")
module.exports = {
    async insert(abr, name, leaderid) {

        
        let result = await connection.query(`insert into pck
        (abr, name, leaderid)
        values
        ($1, $2, $3)`, [abr, name, leaderid]);
        return result;
    },
    async obtain() {
        
        const result = await connection.query(`SELECT pck._id as _id, abr, pck.name as name , leaderid, teachers.name as teachname
    FROM pck, teachers where teachers._id= pck.leaderid`);
   
        return result.rows;
    },
    async obtainPckId(id) {
        const result = await connection.query(`select * from pck where _id = $1`, [id]);
        return result.rows[0];
    },
    async obtainLeader() {
        const result = await connection.query("select _id, name from teachers");
        return result.rows;
    },
    async update(id, abr, name, leaderid) {
        const result = connection.query(`update pck
        set abr = $1,
        name = $2,
        leaderid = $3
        
        where _id = $4`, [  abr, name, leaderid, id]);
        return result;
    },
    async delete(id) {
        const result = connection.query(`delete from pck
        where _id = $1`, [id]);
        return result;
    },
}
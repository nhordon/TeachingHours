const connection = require("../connection")
module.exports = {
    async insert(number, abr,name) {
        let result = await connection.query(`insert into specialities
        (number, abr,name)
        values
        ($1, $2, $3)`, [number, abr,name]);
        return result;
    },
    async obtain() {
        const result = await connection.query("select * from specialities");
        return result.rows;
    },
  
    async obtainSpecialitiesId(id) {
        const result = await connection.query(`select * from specialities where _id = $1`, [id]);
        return result.rows[0];
    },
    async update(id, number, abr,name) {
        const result = connection.query(`update specialities
        set number = $1,
        abr = $2,
        name = $3
        where _id = $4`, [number, abr, name, id]);
        return result;
    },
    async delete(id) {
        const result = connection.query(`delete from specialities
        where _id = $1`, [id]);
        return result;
    },
}
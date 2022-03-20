const connection = require("../connection")
module.exports = {
    async insert(name, payment) {
        let result = await connection.query(`insert into categories
        (name, payment)
        values
        ($1, $2)`, [name, payment]);
        return result;
    },
    async obtain() {
        const result = await connection.query("select * from categories order by name");
        return result.rows;
    },
  
    async obtaincategoriesId(id) {
        const result = await connection.query(`select * from categories where _id = $1`, [id]);
        return result.rows[0];
    },
    async update(id, name, payment) {
        const result = connection.query(`update categories
        set name = $1,
        payment = $2
       
        where _id = $3`, [name, payment, id]);
        return result;
    },
    async delete(id) {
        const result = connection.query(`delete from categories
        where _id = $1`, [id]);
        return result;
    },
}
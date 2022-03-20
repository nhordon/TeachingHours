const connection = require("../connection")
module.exports = {
   
    async insert(name, sovmest, norma, sverh, fact, position,pckid,categoryid) {
        let result = await connection.query(`insert into teachers
        (name, sovmest, norma, sverh, fact, position,pckid,categoryid)
        values
        ($1, $2, $3, $4, $5, $6, $7, $8)`, [name, sovmest, norma, sverh, fact, position,pckid,categoryid]);
        return result;
    },
    async obtain() {
        const result = await connection.query(`
        select teachers._id, teachers.name, sovmest, norma, sverh, fact, 
        position, teachers.categoryid, categories.name as categoryname,  teachers.pckid, pck.abr as abr
        from teachers
         LEFT JOIN categories  ON teachers.categoryid = categories._id
         LEFT JOIN pck ON teachers.pckid = pck._id
         order by teachers.name`);
        return result.rows;
    },
    async obtainTeachersId(id) {
        const result = await connection.query(`select * from teachers where _id = $1`, [id]);
        return result.rows[0];
    },
    async obtainCategoriesName() {
        const result = await connection.query(`select _id, name from categories ORDER BY name`);
        return result.rows;
    },
    async obtainPckAbr() {
        const result = await connection.query(`select _id, abr from pck ORDER BY abr`);
        return result.rows;
    },
    async update(id, name, sovmest, norma, sverh, fact, position,pckid,categoryid) {
        const result = connection.query(`update teachers
        set name = $1,
        sovmest = $2,
        norma = $3,
        sverh = $4,
        fact = $5,
        position = $6,
        pckid = $7,
        categoryid = $8
        where _id = $9`, [name, sovmest, norma, sverh, fact, position,pckid,categoryid, id]);
        return result;
    },
    async delete(id) {
        const result = connection.query(`delete from teachers
        where _id = $1`, [id]);
        return result;
    },
}
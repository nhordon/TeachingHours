const connection = require("../connection")

module.exports = {
    async obtainTeacherPck() {
      
        const result = await connection.query(`SELECT teachers._id, teachers.name,  pck.abr
        FROM teachers , pck where pckid= pck._id order by pck.abr,  teachers.name`);
   
        return result.rows;
    },
    async obtainSubjectsPckGroups() {
      
        const result = await connection.query(`SELECT  abr, 
        subjects.name||'|'||subjectid as subjectname  ,
        groups.name||'|'||groupid as groupname
        FROM eduload, subjects, pck, groups WHERE 
        eduload.subjectid=subjects._id AND subjects.pckid=pck._id 
		AND eduload.groupid=groups._id
		AND eduload.assigned='нерозп'
       
        group BY pck.abr,subjectname, groupname
		ORDER BY pck.abr,subjectname,groupname`);
   
        return result.rows;
    },
    async obtainEduloadTeacher(subjectid, groupid, semestr) {
        const result = await connection.query(`
        SELECT eduload._id,  subjectid, subjects.name as subjectname, groupid,groups.name as groupname,teacherid, semestr, 
        lectures, practices, labs, consultations, exams, credits, courseworks, edupractice, diplompractice, statexam, 
        loaddate, total
	FROM eduload,groups,subjects 
WHERE  eduload.subjectid=subjects._id AND  eduload.groupid=groups._id AND
 eduload.subjectid=${subjectid} AND eduload.groupid=${groupid}  AND eduload.semestr='${semestr}' 

UNION
 
 SELECT eduloadid,subjectid, subjects.name as subjectname, groupid,groups.name as groupname, teachload.teacherid, semestr,
 teachload.lectures, teachload.practices, 
teachload.labs, teachload.consultations, teachload.exams, teachload.credits, 
teachload.courseworks, teachload.edupractice, teachload.diplompractice, teachload.statexam, 
teachload.loaddate, teachload.total
	FROM teachload,eduload, groups,subjects 
WHERE   eduload._id= eduloadid AND eduload.subjectid=subjects._id AND  eduload.groupid=groups._id AND
eduload.subjectid=${subjectid} AND eduload.groupid=${groupid} AND eduload.semestr='${semestr}' 
 ORDER BY teacherid`);
   
        return result.rows;
    },
    
    async insertupdate(eduloadid, teacherid, lectures, practices, labs, consultations, exams, 
        credits, courseworks, edupractice, diplompractice, statexam) {

        
        let result = await connection.query(`insert into teachload(
            eduloadid, teacherid, lectures, practices, labs, consultations, exams, 
            credits, courseworks, edupractice, diplompractice, statexam)
        values
        ($1, $2,  $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
        ON CONFLICT (eduloadid, teacherid) DO UPDATE 
        SET (lectures, practices, labs, consultations, exams, credits, courseworks, 
            edupractice, diplompractice, statexam)=($3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
         [eduloadid, teacherid, lectures, practices, labs, consultations, exams, 
            credits, courseworks, edupractice, diplompractice, statexam]);
                
        return result;
    },
    
    
    async updateeduload(id) {
        const result = connection.query(`update eduload
        set 
        assigned= 'розп'

        where _id = ${id}`);
        return result;
    },
    async delete(eduloadid,teacherid) {
        const result = connection.query(`delete from teachload
        where eduloadid = $1 AND teacherid=$2`, [eduloadid,teacherid]);
        return result;
    },
}
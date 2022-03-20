const connection = require("../connection")

module.exports = {
    async insert(groupid, subjectid, teacherid, semestr, lectures, practices, labs, 
        consultations, exams, credits, courseworks, edupractice, diplompractice,
            statexam,assigned) {

        
        let result = await connection.query(`insert into eduload
        (groupid, subjectid, teacherid, semestr, lectures, practices, labs, 
         consultations, exams, credits, courseworks, edupractice, diplompractice,
             statexam,assigned)
        values
        ($1, $2, ${teacherid}, '${semestr}', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,'${assigned}')`,
         [groupid, subjectid,  lectures, practices, labs, 
            consultations, exams, credits, courseworks, edupractice, diplompractice,
                statexam]);
                
        return result;
    },
  
    async obtain() {
      
        const result = await connection.query(`SELECT t._id as _id, t2._id as eduloadid, t2.groupid, t3.name as groupname ,
        t2.subjectid, t4.name as sub, t2.teacherid, t1.name as teachname, semestr, t2.lectures,
         t2.practices, t2.labs,  t2.classwork, t2.consultations, t2.exams, t2.credits, t2.courseworks, t2.edupractice,
          t2.diplompractice, t2.statexam, t2.total,t2.loaddate,t2.assigned
   FROM eduload t2
   LEFT OUTER JOIN teachers t1 on t2.teacherid=t1._id  
   JOIN groups t3
   ON t3._id = t2.groupid
   JOIN subjects t4
   ON t4._id = t2.subjectid
   JOIN teachload t
   ON t2._id = t.eduloadid
  
UNION
SELECT teachload._id as _id, teachload.eduloadid as eduloadid, eduload.groupid, groups.name as groupname,
eduload.subjectid,subjects.name as sub,teachload.teacherid, teachers.name as teachname, eduload.semestr, 
teachload.lectures, teachload.practices, teachload.labs, teachload.classwork, teachload.consultations, teachload.exams, 
teachload.credits, teachload.courseworks, teachload.edupractice, teachload.diplompractice, teachload.statexam, teachload.total,
teachload.loaddate, assigned 
 FROM    teachload, eduload, groups, subjects, teachers
 WHERE teachload.eduloadid=eduload._id AND eduload.groupid= groups._id AND eduload.subjectid=subjects._id 
 AND teachload.teacherid=teachers._id
 ORDER BY eduloadid,  teachname DESC, groupname`);
   
        return result.rows;
    },
  
    async insertfromhours() {
        
         const result = await connection.query( `INSERT INTO public.eduload(
            groupid, subjectid, semestr, lectures, practices, labs,   edupractice, courseworks, consultations, exams, credits)
           SELECT  groupid, subjectid,  semestr, lectures,  practices, labs,  edupractice, 
		   CASE WHEN courseworks!=0 THEN (groups.studentsdogovor + groups.studentsbudget)*2 ELSE 0 END, 
           CASE WHEN exams!=0 THEN 2 ELSE 0 END,
           CASE WHEN exams!=0 THEN (groups.studentsdogovor + groups.studentsbudget)*0.5 +3  ELSE 0 END,
           CASE WHEN credits!=0 THEN 2  ELSE 0 END
           FROM hours,groups where hours.groupid=groups._id

           ON CONFLICT (groupid,subjectid,semestr) DO UPDATE 
		   SET (lectures, practices, labs,   edupractice, courseworks, consultations, exams, credits )= 
		   (SELECT hours.lectures, hours.practices,  hours.labs,   hours.edupractice,
			 CASE WHEN courseworks!=0 THEN (groups.studentsdogovor + groups.studentsbudget)*2 ELSE 0 END, 
           CASE WHEN exams!=0 THEN 2 ELSE 0 END,
           CASE WHEN exams!=0 THEN (groups.studentsdogovor + groups.studentsbudget)*0.5 +3  ELSE 0 END,
           CASE WHEN credits!=0 THEN 2  ELSE 0 END
			
			FROM hours,groups WHERE  hours.groupid=groups._id AND hours.groupid = eduload.groupid AND
		   hours.subjectid = eduload.subjectid AND hours.semestr = eduload.semestr)
		   WHERE eduload.assigned= 'нерозп'`);
        return result.rows;
    },
    async insertfromhoursgroup(groupid) {
      
         const result = await connection.query( `INSERT INTO public.eduload(
            groupid, subjectid, semestr, lectures, practices, labs,   edupractice, courseworks, consultations, exams, credits)
           SELECT  groupid, subjectid,  semestr, lectures,  practices, labs,  edupractice, 
		   CASE WHEN courseworks!=0 THEN (groups.studentsdogovor + groups.studentsbudget)*2 ELSE 0 END, 
           CASE WHEN exams!=0 THEN 2 ELSE 0 END,
           CASE WHEN exams!=0 THEN (groups.studentsdogovor + groups.studentsbudget)*0.5 +3  ELSE 0 END,
           CASE WHEN credits!=0 THEN 2  ELSE 0 END
           FROM hours,groups where hours.groupid=groups._id AND groupid=${groupid}

           ON CONFLICT (groupid,subjectid,semestr) DO UPDATE 
		   SET (lectures, practices, labs,   edupractice, courseworks, consultations, exams, credits )= 
		   (SELECT hours.lectures, hours.practices,  hours.labs,   hours.edupractice,
			 CASE WHEN courseworks!=0 THEN (groups.studentsdogovor + groups.studentsbudget)*2 ELSE 0 END, 
           CASE WHEN exams!=0 THEN 2 ELSE 0 END,
           CASE WHEN exams!=0 THEN (groups.studentsdogovor + groups.studentsbudget)*0.5 +3  ELSE 0 END,
           CASE WHEN credits!=0 THEN 2  ELSE 0 END
			
			FROM hours,groups WHERE  hours.groupid=groups._id AND hours.groupid = eduload.groupid AND
		   hours.subjectid = eduload.subjectid AND hours.semestr = eduload.semestr)
		   WHERE eduload.assigned= 'нерозп'AND eduload.groupid=${groupid}`);
        return result.rows;
    },
    async obtainEduloadId(id) {
        const result = await connection.query(`select * from eduload where _id = $1`, [id]);
        return result.rows[0];
    },
    async obtainGroupName() {
        const result = await connection.query("select _id, name from groups order by name");
        return result.rows;
    },
    async obtainGroupNameHours() {
        const result = await connection.query(`select   groupid as _id, name from hours, groups 
        WHERE groupid=groups._id GROUP BY groupid, name order by name`);
        return result.rows;
    },
    async obtainTeacherName() {
        const result = await connection.query("select _id, name from teachers order by name");
        return result.rows;
    },   
     async obtainSubjectName() {
        const result = await connection.query("select _id, name from subjects order by name");
        return result.rows;
    },
    async update(id,groupid, subjectid, teacherid, semestr, lectures, practices, labs, 
        consultations, exams, credits, courseworks, edupractice, diplompractice,
            statexam, assigned) {
        const result = connection.query(`update eduload
        set groupid = $1,
        subjectid = $2,
        teacherid = ${teacherid},
        semestr = '${semestr}',
        lectures = $3,
        practices = $4,
        labs= $5, 
        consultations = $6, 
        exams= $7, 
        credits = $8, 
        courseworks =$9, 
        edupractice =$10, 
        diplompractice =$11,
        statexam =$12,
        assigned= '${assigned}'

        where _id = $13`, [ groupid, subjectid,   lectures, practices, labs, 
            consultations, exams, credits, courseworks, edupractice, diplompractice,
                statexam, id]);
        return result;
    },
    async delete(id) {
        const result = connection.query(`delete from eduload
        where _id = $1`, [id]);
        return result;
    },
}
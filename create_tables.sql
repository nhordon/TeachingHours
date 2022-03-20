--
-- PostgreSQL database dump
--




SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 845 (class 1247 OID 16396)
-- Name: courses; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.courses AS ENUM (
    '1',
    '2',
    '3',
    '4'
);


ALTER TYPE public.courses OWNER TO postgres;

--
-- TOC entry 848 (class 1247 OID 16406)
-- Name: nameprograms; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nameprograms AS ENUM (
    'ЗОП',
    'ОПП'
);


ALTER TYPE public.nameprograms OWNER TO postgres;

--
-- TOC entry 851 (class 1247 OID 16412)
-- Name: numsemestr; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.numsemestr AS ENUM (
    '1',
    '2'
);


ALTER TYPE public.numsemestr OWNER TO postgres;

--
-- TOC entry 854 (class 1247 OID 16418)
-- Name: teachassigned; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.teachassigned AS ENUM (
    'нерозп',
    'розп'
);


ALTER TYPE public.teachassigned OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 209 (class 1259 OID 16423)
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    _id integer NOT NULL,
    name character varying(4) NOT NULL,
    course public.courses NOT NULL,
    specid smallint,
    dogovor boolean,
    studentsbudget smallint,
    studentsdogovor smallint
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- TOC entry 227 (class 1255 OID 16426)
-- Name: finishcase(public.groups, numeric, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.finishcase(rec public.groups, p_column numeric, p_dogovor boolean) RETURNS numeric
    LANGUAGE sql
    AS $_$
SELECT  case when p_dogovor=false then   p_column- floor(p_column * $1.studentsdogovor/($1.studentsbudget+$1.studentsdogovor))
else floor(p_column * $1.studentsdogovor/($1.studentsbudget+$1.studentsdogovor)) end

  
$_$;


ALTER FUNCTION public.finishcase(rec public.groups, p_column numeric, p_dogovor boolean) OWNER TO postgres;


CREATE TABLE public.subjects (
    _id integer NOT NULL,
    name character varying(100),
    fullname character varying(300),
    pckid smallint,
    programs public.nameprograms DEFAULT 'ОПП'::public.nameprograms
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 16447)
-- Name: teachers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teachers (
    _id integer NOT NULL,
    name character varying(100),
    sovmest boolean DEFAULT false,
    norma smallint DEFAULT 720,
    sverh real DEFAULT 0,
    fact real,
    "position" character varying(200),
    pckid integer,
    categoryid integer
);


ALTER TABLE public.teachers OWNER TO postgres;

--
-- TOC entry 229 (class 1255 OID 16453)
-- Name: subselect(public.teachers, public.groups, public.subjects, numeric, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.subselect(rec public.teachers, public.groups, public.subjects, p_column numeric, p_dogovor boolean) RETURNS numeric
    LANGUAGE sql
    AS $_$
 
  SELECT  p_column
 FROM  teachers teach2, subjects sub2,  groups gr2, teachload left join  eduload on eduload._id=teachload.eduloadid 
	where  gr2.dogovor=p_dogovor 
	AND eduload.groupid=gr2._id AND eduload.subjectid=sub2._id AND teachload.teacherid= teach2._id
	AND eduload.semestr='2'
	AND teach2.name=$1.name AND gr2.name=$2.name AND sub2.name=$3.name
  
$_$;


ALTER FUNCTION public.subselect(rec public.teachers, public.groups, public.subjects, p_column numeric, p_dogovor boolean) OWNER TO postgres;

--
-- TOC entry 230 (class 1255 OID 16454)
-- Name: subselectfinish(public.teachers, public.groups, public.subjects, numeric, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.subselectfinish(rec public.teachers, public.groups, public.subjects, p_column numeric, p_dogovor boolean) RETURNS numeric
    LANGUAGE sql
    AS $_$
SELECT  finishcase($2,p_column, p_dogovor)


FROM  teachers teach2, subjects sub2,  groups gr2, teachload left join  eduload on eduload._id=teachload.eduloadid 
	where case when p_dogovor=false then gr2.studentsbudget>0 else gr2.studentsdogovor>0 end
	AND eduload.groupid=gr2._id AND eduload.subjectid=sub2._id AND teachload.teacherid= teach2._id
	AND eduload.semestr='2'
	AND teach2.name=$1.name AND gr2.name=$2.name AND sub2.name=$3.name
$_$;


ALTER FUNCTION public.subselectfinish(rec public.teachers, public.groups, public.subjects, p_column numeric, p_dogovor boolean) OWNER TO postgres;

--
-- TOC entry 231 (class 1255 OID 16455)
-- Name: subselectgroup(public.teachers, public.groups, public.subjects, numeric, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.subselectgroup(rec public.teachers, public.groups, public.subjects, p_column numeric, p_dogovor boolean) RETURNS numeric
    LANGUAGE sql
    AS $_$
 
  
  SELECT sum( p_column )
FROM  teachers teach2, subjects sub2,  groups gr2, teachload left join  eduload on eduload._id=teachload.eduloadid 
	where  gr2.dogovor=p_dogovor 
	AND eduload.groupid=gr2._id AND eduload.subjectid=sub2._id AND teachload.teacherid= teach2._id	
	AND teach2.name=$1.name AND gr2.name=$2.name AND sub2.name=$3.name
	group by gr2.name
  
$_$;


ALTER FUNCTION public.subselectgroup(rec public.teachers, public.groups, public.subjects, p_column numeric, p_dogovor boolean) OWNER TO postgres;

--
-- TOC entry 232 (class 1255 OID 16456)
-- Name: subselectgroupfinish(public.teachers, public.groups, public.subjects, numeric, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.subselectgroupfinish(rec public.teachers, public.groups, public.subjects, p_column numeric, p_dogovor boolean) RETURNS numeric
    LANGUAGE sql
    AS $_$
select sum(finishcase($2,p_column,p_dogovor))


FROM  teachers teach2, subjects sub2,  groups gr2, teachload left join  eduload on eduload._id=teachload.eduloadid 
	where case when p_dogovor=false then gr2.studentsbudget>0 else gr2.studentsdogovor>0 end
	AND eduload.groupid=gr2._id AND eduload.subjectid=sub2._id AND teachload.teacherid= teach2._id
	 
	AND teach2.name=$1.name AND gr2.name=$2.name AND sub2.name=$3.name
group by gr2.name
$_$;


ALTER FUNCTION public.subselectgroupfinish(rec public.teachers, public.groups, public.subjects, p_column numeric, p_dogovor boolean) OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 16457)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    _id integer NOT NULL,
    name character varying(200) NOT NULL,
    payment numeric(7,2) DEFAULT 0.00
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 16461)
-- Name: eduload; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.eduload (
    _id bigint NOT NULL,
    groupid smallint,
    subjectid integer NOT NULL,
    teacherid integer,
    semestr public.numsemestr DEFAULT '1'::public.numsemestr,
    lectures numeric(5,1) DEFAULT 0.0,
    practices numeric(5,1) DEFAULT 0.0,
    labs numeric(5,1) DEFAULT 0.0,
    classwork numeric(5,1) GENERATED ALWAYS AS (((lectures + labs) + practices)) STORED,
    consultations numeric(5,1) DEFAULT 0.0,
    exams numeric(5,1) DEFAULT 0.0,
    credits numeric(5,1) DEFAULT 0.0,
    courseworks numeric(5,1) DEFAULT 0.0,
    edupractice numeric(5,1) DEFAULT 0.0,
    diplompractice numeric(5,1) DEFAULT 0.0,
    statexam numeric(5,1) DEFAULT 0.0,
    loaddate timestamp without time zone DEFAULT now() NOT NULL,
    total numeric(7,1) GENERATED ALWAYS AS ((((((((((lectures + labs) + practices) + courseworks) + consultations) + exams) + credits) + edupractice) + diplompractice) + statexam)) STORED,
    assigned public.teachassigned DEFAULT 'нерозп'::public.teachassigned
);


ALTER TABLE public.eduload OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16479)
-- Name: eduload__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.eduload__id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.eduload__id_seq OWNER TO postgres;

--
-- TOC entry 3468 (class 0 OID 0)
-- Dependencies: 215
-- Name: eduload__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.eduload__id_seq OWNED BY public.eduload._id;


--
-- TOC entry 216 (class 1259 OID 16480)
-- Name: groups__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.groups__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.groups__id_seq OWNER TO postgres;

--
-- TOC entry 3469 (class 0 OID 0)
-- Dependencies: 216
-- Name: groups__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.groups__id_seq OWNED BY public.groups._id;


--
-- TOC entry 217 (class 1259 OID 16481)
-- Name: hours__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hours__id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.hours__id_seq OWNER TO postgres;

--
-- TOC entry 3470 (class 0 OID 0)
-- Dependencies: 217
-- Name: hours__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hours__id_seq OWNED BY public.hours._id;


--
-- TOC entry 218 (class 1259 OID 16482)
-- Name: pck; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pck (
    _id integer NOT NULL,
    abr character varying(40),
    name character varying(50),
    leaderid integer
);


ALTER TABLE public.pck OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16485)
-- Name: pck__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pck__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pck__id_seq OWNER TO postgres;

--
-- TOC entry 3471 (class 0 OID 0)
-- Dependencies: 219
-- Name: pck__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pck__id_seq OWNED BY public.pck._id;


--
-- TOC entry 220 (class 1259 OID 16486)
-- Name: specialities_id; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.specialities_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.specialities_id OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16487)
-- Name: specialities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.specialities (
    _id smallint DEFAULT nextval('public.specialities_id'::regclass) NOT NULL,
    number character varying(20),
    abr character varying(5),
    name character varying(70)
);


ALTER TABLE public.specialities OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16491)
-- Name: subjects__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subjects__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subjects__id_seq OWNER TO postgres;

--
-- TOC entry 3472 (class 0 OID 0)
-- Dependencies: 222
-- Name: subjects__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subjects__id_seq OWNED BY public.subjects._id;


--
-- TOC entry 223 (class 1259 OID 16492)
-- Name: teachcategory__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teachcategory__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teachcategory__id_seq OWNER TO postgres;

--
-- TOC entry 3473 (class 0 OID 0)
-- Dependencies: 223
-- Name: teachcategory__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teachcategory__id_seq OWNED BY public.categories._id;


--
-- TOC entry 224 (class 1259 OID 16493)
-- Name: teachers__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teachers__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teachers__id_seq OWNER TO postgres;

--
-- TOC entry 3474 (class 0 OID 0)
-- Dependencies: 224
-- Name: teachers__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teachers__id_seq OWNED BY public.teachers._id;


--
-- TOC entry 225 (class 1259 OID 16494)
-- Name: teachload; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teachload (
    _id integer NOT NULL,
    eduloadid bigint NOT NULL,
    teacherid integer NOT NULL,
    lectures numeric(5,1) DEFAULT 0.0,
    practices numeric(5,1) DEFAULT 0.0,
    labs numeric(5,1) DEFAULT 0.0,
    classwork numeric(5,1) GENERATED ALWAYS AS (((lectures + labs) + practices)) STORED,
    consultations numeric(5,1) DEFAULT 0.0,
    exams numeric(5,1) DEFAULT 0.0,
    credits numeric(5,1) DEFAULT 0.0,
    courseworks numeric(5,1) DEFAULT 0.0,
    edupractice numeric(5,1) DEFAULT 0.0,
    diplompractice numeric(5,1) DEFAULT 0.0,
    statexam numeric(5,1) DEFAULT 0.0,
    loaddate timestamp without time zone DEFAULT now() NOT NULL,
    total numeric(5,1) GENERATED ALWAYS AS ((((((((((lectures + labs) + practices) + courseworks) + consultations) + exams) + credits) + edupractice) + diplompractice) + statexam)) STORED
);


ALTER TABLE public.teachload OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16510)
-- Name: teachload__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teachload__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teachload__id_seq OWNER TO postgres;

--
-- TOC entry 3475 (class 0 OID 0)
-- Dependencies: 226
-- Name: teachload__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teachload__id_seq OWNED BY public.teachload._id;


--
-- TOC entry 3243 (class 2604 OID 16511)
-- Name: categories _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN _id SET DEFAULT nextval('public.teachcategory__id_seq'::regclass);


--
-- TOC entry 3259 (class 2604 OID 16512)
-- Name: eduload _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eduload ALTER COLUMN _id SET DEFAULT nextval('public.eduload__id_seq'::regclass);


--
-- TOC entry 3222 (class 2604 OID 16513)
-- Name: groups _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups ALTER COLUMN _id SET DEFAULT nextval('public.groups__id_seq'::regclass);


--
-- TOC entry 3235 (class 2604 OID 16514)
-- Name: hours _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hours ALTER COLUMN _id SET DEFAULT nextval('public.hours__id_seq'::regclass);


--
-- TOC entry 3260 (class 2604 OID 16515)
-- Name: pck _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pck ALTER COLUMN _id SET DEFAULT nextval('public.pck__id_seq'::regclass);


--
-- TOC entry 3237 (class 2604 OID 16516)
-- Name: subjects _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects ALTER COLUMN _id SET DEFAULT nextval('public.subjects__id_seq'::regclass);


--
-- TOC entry 3241 (class 2604 OID 16517)
-- Name: teachers _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers ALTER COLUMN _id SET DEFAULT nextval('public.teachers__id_seq'::regclass);


--
-- TOC entry 3275 (class 2604 OID 16518)
-- Name: teachload _id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachload ALTER COLUMN _id SET DEFAULT nextval('public.teachload__id_seq'::regclass);


--
-- TOC entry 3298 (class 2606 OID 16520)
-- Name: eduload eduload_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eduload
    ADD CONSTRAINT eduload_pkey PRIMARY KEY (_id);


--
-- TOC entry 3277 (class 2606 OID 16522)
-- Name: groups groups_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_name_key UNIQUE (name);


--
-- TOC entry 3279 (class 2606 OID 16524)
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (_id);


--
-- TOC entry 3281 (class 2606 OID 16526)
-- Name: hours hours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hours
    ADD CONSTRAINT hours_pkey PRIMARY KEY (_id);


--
-- TOC entry 3301 (class 2606 OID 16528)
-- Name: pck pck_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pck
    ADD CONSTRAINT pck_name_key UNIQUE (name);


--
-- TOC entry 3303 (class 2606 OID 16530)
-- Name: pck pck_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pck
    ADD CONSTRAINT pck_pkey PRIMARY KEY (_id);


--
-- TOC entry 3305 (class 2606 OID 16532)
-- Name: specialities specialities__id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialities
    ADD CONSTRAINT specialities__id_key UNIQUE (_id);


--
-- TOC entry 3307 (class 2606 OID 16534)
-- Name: specialities specialities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialities
    ADD CONSTRAINT specialities_pkey PRIMARY KEY (_id);


--
-- TOC entry 3284 (class 2606 OID 16536)
-- Name: subjects subjects_fullname_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_fullname_key UNIQUE (fullname);


--
-- TOC entry 3286 (class 2606 OID 16538)
-- Name: subjects subjects_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_name_key UNIQUE (name);


--
-- TOC entry 3288 (class 2606 OID 16540)
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (_id);


--
-- TOC entry 3294 (class 2606 OID 16542)
-- Name: categories teachcategory_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT teachcategory_name_key UNIQUE (name);


--
-- TOC entry 3296 (class 2606 OID 16544)
-- Name: categories teachcategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT teachcategory_pkey PRIMARY KEY (_id);


--
-- TOC entry 3290 (class 2606 OID 16546)
-- Name: teachers teachers_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_name_key UNIQUE (name);


--
-- TOC entry 3292 (class 2606 OID 16548)
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (_id);


--
-- TOC entry 3309 (class 2606 OID 16550)
-- Name: teachload teachload_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachload
    ADD CONSTRAINT teachload_pkey PRIMARY KEY (_id);


--
-- TOC entry 3299 (class 1259 OID 16551)
-- Name: eduload_uni; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX eduload_uni ON public.eduload USING btree (groupid, subjectid, semestr);


--
-- TOC entry 3282 (class 1259 OID 16552)
-- Name: hours_uni; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX hours_uni ON public.hours USING btree (groupid, subjectid, semestr);


--
-- TOC entry 3310 (class 1259 OID 16553)
-- Name: teachload_uni; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX teachload_uni ON public.teachload USING btree (eduloadid, teacherid);


--
-- TOC entry 3318 (class 2606 OID 16554)
-- Name: eduload eduload_groupid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eduload
    ADD CONSTRAINT eduload_groupid_fkey FOREIGN KEY (groupid) REFERENCES public.groups(_id);


--
-- TOC entry 3319 (class 2606 OID 16559)
-- Name: eduload eduload_subjectid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eduload
    ADD CONSTRAINT eduload_subjectid_fkey FOREIGN KEY (subjectid) REFERENCES public.subjects(_id);


--
-- TOC entry 3320 (class 2606 OID 16564)
-- Name: eduload eduload_teacherid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eduload
    ADD CONSTRAINT eduload_teacherid_fkey FOREIGN KEY (teacherid) REFERENCES public.teachers(_id);


--
-- TOC entry 3311 (class 2606 OID 16569)
-- Name: groups groups_specid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_specid_fkey FOREIGN KEY (specid) REFERENCES public.specialities(_id);


--
-- TOC entry 3312 (class 2606 OID 16574)
-- Name: hours hours_groupid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hours
    ADD CONSTRAINT hours_groupid_fkey FOREIGN KEY (groupid) REFERENCES public.groups(_id);


--
-- TOC entry 3313 (class 2606 OID 16579)
-- Name: hours hours_pckid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hours
    ADD CONSTRAINT hours_pckid_fkey FOREIGN KEY (pckid) REFERENCES public.pck(_id);


--
-- TOC entry 3314 (class 2606 OID 16584)
-- Name: hours hours_subjectid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hours
    ADD CONSTRAINT hours_subjectid_fkey FOREIGN KEY (subjectid) REFERENCES public.subjects(_id);


--
-- TOC entry 3321 (class 2606 OID 16589)
-- Name: pck pck_teachers_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pck
    ADD CONSTRAINT pck_teachers_fkey FOREIGN KEY (leaderid) REFERENCES public.teachers(_id);


--
-- TOC entry 3315 (class 2606 OID 16594)
-- Name: subjects subjects_pckid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pckid_fkey FOREIGN KEY (pckid) REFERENCES public.pck(_id);


--
-- TOC entry 3316 (class 2606 OID 16599)
-- Name: teachers teachers_categoryid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_categoryid_fkey FOREIGN KEY (categoryid) REFERENCES public.categories(_id);


--
-- TOC entry 3317 (class 2606 OID 16604)
-- Name: teachers teachers_pckid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pckid_fkey FOREIGN KEY (pckid) REFERENCES public.pck(_id);


--
-- TOC entry 3322 (class 2606 OID 16609)
-- Name: teachload teachload_eduloadid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachload
    ADD CONSTRAINT teachload_eduloadid_fkey FOREIGN KEY (eduloadid) REFERENCES public.eduload(_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3323 (class 2606 OID 16614)
-- Name: teachload teachload_teacherid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachload
    ADD CONSTRAINT teachload_teacherid_fkey FOREIGN KEY (teacherid) REFERENCES public.teachers(_id);




--
-- PostgreSQL database dump complete
--


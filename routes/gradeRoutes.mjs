import express, { Router } from 'express'
import db from '../db/conn.mjs'
import gradesCTRL from '../controllers/grades.Controller.mjs';

let router = express.Router();

router.get('/', gradesCTRL.getAvgGrades);
//router.get('/:classId', gradesCTRL.getGradesByClassId)
router.get('/learner/:id/avg', gradesCTRL.getLearnerAvg)
router.get('/stats', gradesCTRL.getStats)

export default router;
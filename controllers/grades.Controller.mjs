import db from "../db/conn.mjs";

async function getAvgGrades(req, res) {
    //Specify Collection
    let collection = await db.collection('grades');
    let result = await collection
        .aggregate(
            [
                {
                    $project: {
                        _id: 0,
                        class_id: 1,
                        learner_id: 1,
                        avg: { $avg: '$scores.score' },
                    },
                },
            ],
            { maxTimeMS: 60000, allowDiskUse: true }
        )
        .limit(10)
        .toArray();
    res.json(result);
}

async function getGradesByClassId(req, res) {
    let collection = await db.collection('grades');
    const classId = req.params.classId;
    console.log(classId);

    let result = await collection.aggregate(
        [
            {
                $match: { class_id: +classId }
            },
            {
                $facet: {
                    projection: [
                        {
                            $project: {
                                _id: 0,
                                class_id: 1,
                                learner_id: 1,
                                avg: { $avg: "$scores.score" }
                            }
                        }
                    ],
                    count: [
                        { $count: "TotalScores" }
                    ]
                }
            }
        ],
        { maxTimeMS: 60000, allowDiskUse: true }
    ).toArray();
    res.json(result);
}

async function getLearnerAvg(req, res) {
    let collection = await db.collection("grades");

    let result = await collection
        .aggregate([
            {
                $match: { learner_id: Number(req.params.id) },
            },
            {
                $unwind: { path: "$scores" },
            },
            {
                $group: {
                    _id: "$class_id",
                    quiz: {
                        $push: {
                            $cond: {
                                if: { $eq: ["$scores.type", "quiz"] },
                                then: "$scores.score",
                                else: "$$REMOVE",
                            },
                        },
                    },
                    exam: {
                        $push: {
                            $cond: {
                                if: { $eq: ["$scores.type", "exam"] },
                                then: "$scores.score",
                                else: "$$REMOVE",
                            },
                        },
                    },
                    homework: {
                        $push: {
                            $cond: {
                                if: { $eq: ["$scores.type", "homework"] },
                                then: "$scores.score",
                                else: "$$REMOVE",
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    class_id: "$_id",
                    avg: {
                        $sum: [
                            { $multiply: [{ $avg: "$exam" }, 0.5] },
                            { $multiply: [{ $avg: "$quiz" }, 0.3] },
                            { $multiply: [{ $avg: "$homework" }, 0.2] },
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalAvg: { $avg: "$avg" }
                }
            }
        ])
        .toArray();

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
    ;
}


async function getStats(req, res) {
    let collection = await db.collection("grades");

    let result = await collection
        .aggregate([
            // {
            //   $match: { learner_id: Number(req.params.id) },
            // },
            {
                $unwind: { path: "$scores" },
            },
            {
                $group: {
                    // _id: {
                    //     //class_id: "$class_id",
                    //     learner_id: "$learner_id"
                    // },
                    _id: "$learner_id",
                    quiz: {
                        $push: {
                            $cond: {
                                if: { $eq: ["$scores.type", "quiz"] },
                                then: "$scores.score",
                                else: "$$REMOVE",
                            },
                        },
                    },
                    exam: {
                        $push: {
                            $cond: {
                                if: { $eq: ["$scores.type", "exam"] },
                                then: "$scores.score",
                                else: "$$REMOVE",
                            },
                        },
                    },
                    homework: {
                        $push: {
                            $cond: {
                                if: { $eq: ["$scores.type", "homework"] },
                                then: "$scores.score",
                                else: "$$REMOVE",
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    //class_id: "$_id",
                    learner_id: "$_id",
                    avg: {
                        $sum: [
                            { $multiply: [{ $avg: "$exam" }, 0.5] },
                            { $multiply: [{ $avg: "$quiz" }, 0.3] },
                            { $multiply: [{ $avg: "$homework" }, 0.2] },
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    above60: { $sum: { $cond: [{ $gt: ["$avg", 60] }, 1, 0] } }
                }

            },
            {
                $project: {
                    totalLearners: "$total",
                    above60: "$above60",
                    percentageOfLearnersAbove60: {
                        $multiply: [{
                            $divide: [
                                "$above60",
                                "$total"
                            ]
                        }, 100 //to get the percentile
                        ]
                    }
                }
            }

        ])
        .toArray();

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
    ;
}




export default { getAvgGrades, getGradesByClassId, getLearnerAvg, getStats }
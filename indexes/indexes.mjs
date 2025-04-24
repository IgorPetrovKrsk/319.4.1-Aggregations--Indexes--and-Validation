import db from '../db/conn.mjs'

try {
    let collection = await db.collection("grades");
    await collection.createIndex({ "class_id": 1 });
    await collection.createIndex({ 'learner_id': 1 });
    await collection.createIndex({ 'learner_id': 1, 'class_id': 1 });
    console.log("Indexes are created");
} catch (err) {
    console.error(err);
}

export default null // to import in server.mjs and execute as an IFII 

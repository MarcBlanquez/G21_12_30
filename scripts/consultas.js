// Ejercicio 1: Diseño del Esquema de la Base de Datos

		// Esquema de la colección restaurants

db.createCollection("restaurants", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "address", "rating", "type_of_food", "url"],
      properties: {
        name: { bsonType: "string", description: "Nombre del restaurante" },
        address: {
          bsonType: "object",
          required: ["street", "city", "postcode"],
          properties: {
            street: { bsonType: "string" },
            city: { bsonType: "string" },
            postcode: { bsonType: "string" }
          }
        },
        rating: { bsonType: "int", minimum: 0, maximum: 5 },
        type_of_food: { bsonType: "string" },
        url: { bsonType: "string" }
      }
    }
  }
});

		// Esquema de la colección inspections
db.createCollection("inspections", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["restaurant_id", "certificate_number", "date", "result", "sector", "address"],
      properties: {
        restaurant_id: { bsonType: "objectId", description: "Referencia al restaurante" },
        certificate_number: { bsonType: "int" },
        date: { bsonType: "string", description: "Fecha de inspección en formato YYYY-MM-DD" },
        result: { bsonType: "string" },
        sector: { bsonType: "string" },
        address: {
          bsonType: "object",
          required: ["street", "city", "postcode"],
          properties: {
            street: { bsonType: "string" },
            city: { bsonType: "string" },
            postcode: { bsonType: "string" }
          }
        }
      }
    }
  }
});


// Ejercicio 2: Consultas en MongoDB


db.restaurants.find({ type_of_food: "Chinese" });
db.inspections.find({ result: { $ne: "No Violation Issued" } }).sort({ date: -1 });
db.restaurants.find({ rating: { $gt: 4 } });


// Ejercicio 3: Uso del Aggregation Framework


db.restaurants.aggregate([
  {
    $group: {
      _id: "$type_of_food",
      avg_rating: { $avg: "$rating" },
      count: { $sum: 1 }
    }
  },
  { $sort: { avg_rating: -1 } }
]);


db.inspections.aggregate([
  {
    $group: {
      _id: "$result",
      count: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 1,
      count: 1,
      percentage: {
        $multiply: [{ $divide: ["$count", db.inspections.countDocuments()] }, 100]
      }
    }
  }
]);


db.restaurants.aggregate([
  {
    $lookup: {
      from: "inspections",
      localField: "_id",
      foreignField: "restaurant_id",
      as: "inspection_history"
    }
  }
]);


// Ejercicio 4: Optimización del Rendimiento


db.restaurants.createIndex({ type_of_food: 1 });
db.restaurants.createIndex({ rating: -1 });
db.inspections.createIndex({ restaurant_id: 1 });
db.restaurants.find({ type_of_food: "Chinese" }).explain("executionStats");

// Ejercicio 5: Estrategias de Escalabilidad


sh.shardCollection("miDB.restaurants", { "address.city": "hashed" });
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "server1:27017" },
    { _id: 1, host: "server2:27017" },
    { _id: 2, host: "server3:27017", arbiterOnly: true }
  ]
});

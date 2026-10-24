const { MongoClient } = require('mongodb');
const Redis = require('ioredis');
const cassandra = require('cassandra-driver');
const neo4j = require('neo4j-driver');
require('dotenv').config();

// 1. MONGODB CLIENT
const mongoClient = new MongoClient(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/elearning_nosql');
let mongoDb = null;

async function connectMongoDB() {
  try {
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    console.log('[MongoDB]   Da ket noi thanh cong');
    return mongoDb;
  } catch (err) {
    console.error('[MongoDB]   Loi ket noi:', err.message);
    return null;
  }
}

// 2. REDIS CLIENT
const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 5) return null;
    return Math.min(times * 150, 1500);
  }
});

redisClient.on('connect', () => console.log('[Redis]     Da ket noi thanh cong'));
redisClient.on('error', (err) => console.error('[Redis]     Loi ket noi:', err.message));

async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('[Redis]     Khong the ket noi toi Redis Server');
  }
}

// 3. APACHE CASSANDRA CLIENT
const cassandraClient = new cassandra.Client({
  contactPoints: [process.env.CASSANDRA_CONTACT_POINTS || '127.0.0.1'],
  localDataCenter: process.env.CASSANDRA_LOCAL_DATA_CENTER || 'datacenter1',
  keyspace: process.env.CASSANDRA_KEYSPACE || 'elearning_logs'
});

async function connectCassandra() {
  try {
    await cassandraClient.connect();
    console.log('[Cassandra] Da ket noi thanh cong');
  } catch (err) {
    console.error('[Cassandra] Loi ket noi:', err.message);
  }
}

// 4. NEO4J DRIVER
const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://127.0.0.1:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'nosql_project_2026'
  )
);

async function connectNeo4j() {
  try {
    await neo4jDriver.verifyConnectivity();
    console.log('[Neo4j]     Da ket noi thanh cong');
  } catch (err) {
    console.error('[Neo4j]     Loi ket noi:', err.message);
  }
}

// HAM KHOI DONG TOAN BO 4 KET NOI
async function connectAllDatabases() {
  console.log('--- DANG KHOI TAO KET NOI TOI 4 HET QUAN TRI NOSQL ---');
  await connectMongoDB();
  await connectRedis();
  await connectCassandra();
  await connectNeo4j();
}

module.exports = {
  mongoClient,
  getMongoDb: () => mongoDb,
  redisClient,
  cassandraClient,
  neo4jDriver,
  connectAllDatabases
};

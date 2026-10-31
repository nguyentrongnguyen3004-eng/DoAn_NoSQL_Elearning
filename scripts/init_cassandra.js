const path = require('path');
const cassandra = require(path.join(__dirname, '../01_Source_Code_EduPro/node_modules/cassandra-driver'));

async function init() {
  const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1'
  });
  await client.connect();
  console.log('Connected to Cassandra cluster on 127.0.0.1:9042!');

  // 1. Create keyspace
  await client.execute(
    "CREATE KEYSPACE IF NOT EXISTS elearning_logs " +
    "WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};"
  );
  console.log('1. Created keyspace: elearning_logs');

  // 2. Create learning_events table
  await client.execute(
    "CREATE TABLE IF NOT EXISTS elearning_logs.learning_events (" +
    "  student_id text," +
    "  event_time timestamp," +
    "  event_id uuid," +
    "  event_type text," +
    "  course_id text," +
    "  lesson_id text," +
    "  session_id text," +
    "  duration_seconds int," +
    "  payload text," +
    "  PRIMARY KEY ((student_id), event_time, event_id)" +
    ") WITH CLUSTERING ORDER BY (event_time DESC, event_id ASC);"
  );
  console.log('2. Created table: learning_events');

  // 3. Create heartbeat_stream table
  await client.execute(
    "CREATE TABLE IF NOT EXISTS elearning_logs.heartbeat_stream (" +
    "  session_id text," +
    "  user_id text," +
    "  course_id text," +
    "  lesson_id text," +
    "  timestamp timestamp," +
    "  video_current_time double," +
    "  is_anomaly boolean," +
    "  PRIMARY KEY ((session_id), timestamp)" +
    ") WITH CLUSTERING ORDER BY (timestamp DESC);"
  );
  console.log('3. Created table: heartbeat_stream');

  // 4. Create anti_cheat_logs table
  await client.execute(
    "CREATE TABLE IF NOT EXISTS elearning_logs.anti_cheat_logs (" +
    "  student_code text," +
    "  exam_id text," +
    "  violation_type text," +
    "  timestamp timestamp," +
    "  ip_address text," +
    "  user_agent text," +
    "  details text," +
    "  PRIMARY KEY ((student_code, exam_id), timestamp)" +
    ") WITH CLUSTERING ORDER BY (timestamp DESC);"
  );
  console.log('4. Created table: anti_cheat_logs');

  // 5. Seed sample data
  await client.execute(
    "INSERT INTO elearning_logs.learning_events (student_id, event_time, event_id, event_type, course_id, lesson_id, session_id, duration_seconds, payload) " +
    "VALUES ('2001230589', toTimestamp(now()), uuid(), 'PLAY_LESSON', '670000000000000000000010', '670000000000000000000021', 'SESS_IELTS_01', 0, '{\"course\": \"IELTS Masterclass 7.5+\"}');"
  );
  await client.execute(
    "INSERT INTO elearning_logs.heartbeat_stream (session_id, user_id, course_id, lesson_id, timestamp, video_current_time, is_anomaly) " +
    "VALUES ('SESS_IELTS_01', '2001230589', '670000000000000000000010', '670000000000000000000021', toTimestamp(now()), 15.5, false);"
  );
  await client.execute(
    "INSERT INTO elearning_logs.heartbeat_stream (session_id, user_id, course_id, lesson_id, timestamp, video_current_time, is_anomaly) " +
    "VALUES ('SESS_IELTS_01', '2001230589', '670000000000000000000010', '670000000000000000000021', toTimestamp(now()), 120.0, true);"
  );
  await client.execute(
    "INSERT INTO elearning_logs.anti_cheat_logs (student_code, exam_id, violation_type, timestamp, ip_address, user_agent, details) " +
    "VALUES ('2001230589', 'EXAM_01', 'TAB_SWITCH', toTimestamp(now()), '127.0.0.1', 'Chrome/124.0 Windows 11', '{\"warning\": \"Chuyen tab 1 lan\"}');"
  );
  console.log('5. Sample records inserted successfully!');

  await client.shutdown();
  console.log('All done! Cassandra is fully ready and seeded.');
}

init().catch(err => console.error('Error initializing Cassandra:', err));

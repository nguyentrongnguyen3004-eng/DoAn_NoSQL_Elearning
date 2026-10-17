// ==============================================================================
// HOC PHAN DU LIEU NOSQL - HUIT (KHOA CNTT)
// SCRIPT TRINH DIEN CAC THAO TAC REDIS THEO DUNG SRS VA DANG KY MON HOC
// NHOM 18: NEN TANG E-LEARNING & LUYEN THI TRAC NGHIEM
// ==============================================================================

const Redis = require('ioredis');

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

async function demoRedisOperations() {
  const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    lazyConnect: true
  });

  try {
    await redis.connect();
    console.log('Da ket noi toi Redis!');

    const examId = '670000000000000000000040';
    const studentId = '2001230589';
    const attemptId = 'ATTEMPT_9901';

    // -------------------------------------------------------------------------
    // 1. NHOM DU LIEU 1: LUU PHIEN LAM BAI THI CO THOI GIAN HET HAN (TTL)
    // -------------------------------------------------------------------------
    console.log('\n--- 1. LUU PHIEN THI TAM & SET TTL ---');
    const attemptKey = `exam:${examId}:attempt:${studentId}`;
    const attemptData = {
      attemptId: attemptId,
      startTime: new Date().toISOString(),
      durationMinutes: 30,
      status: 'IN_PROGRESS'
    };
    // Luu String JSON voi TTL la 1800 giay (30 phut)
    await redis.set(attemptKey, JSON.stringify(attemptData), 'EX', 1800);
    const ttl = await redis.ttl(attemptKey);
    console.log(`Key '${attemptKey}' da luu voi TTL con lai: ${ttl} giay`);

    // -------------------------------------------------------------------------
    // 2. NHOM DU LIEU 2: LUU DAP AN TAM THOI (DANG HASH) VOI TTL
    // -------------------------------------------------------------------------
    console.log('\n--- 2. LUU DAP AN TAM THOI (HASH) ---');
    const answersKey = `exam:${examId}:answers:${attemptId}`;
    await redis.hset(answersKey, 'q1', 'B');
    await redis.hset(answersKey, 'q2', 'C');
    await redis.hset(answersKey, 'q3', 'B');
    await redis.expire(answersKey, 1800);

    const savedAnswers = await redis.hgetall(answersKey);
    console.log(`Dap an tam thoi trong Hash '${answersKey}':`, savedAnswers);

    // -------------------------------------------------------------------------
    // 3. NHOM DU LIEU 3: BANG XEP HANG THI DUA (SORTED SET - ZSET)
    // -------------------------------------------------------------------------
    console.log('\n--- 3. BANG XEP HANG (SORTED SET - ZSET) ---');
    const leaderboardKey = `leaderboard:${examId}`;
    // Them diem so cho cac sinh vien
    await redis.zadd(leaderboardKey, 10.0, 'Nguyen Trong Nguyen (2001230589)');
    await redis.zadd(leaderboardKey, 7.5, 'Pham Nguyen Khoi Nguyen (2001230578)');
    await redis.zadd(leaderboardKey, 8.5, 'Vo Huynh Gia Huy (2001230303)');

    // Lay top 3 nguoi diem cao nhat (kem theo diem)
    const topRank = await redis.zrevrange(leaderboardKey, 0, 2, 'WITHSCORES');
    console.log(`Top thi sinh diem cao nhat '${leaderboardKey}':`);
    for (let i = 0; i < topRank.length; i += 2) {
      console.log(`  Top ${i / 2 + 1}: ${topRank[i]} - Diem: ${topRank[i + 1]}`);
    }

    // -------------------------------------------------------------------------
    // 4. NHOM DU LIEU 4: CACHE THONG TIN KHOA HOC
    // -------------------------------------------------------------------------
    console.log('\n--- 4. CACHE THONG TIN KHOA HOC (CACHE STRING) ---');
    const courseCacheKey = 'cache:course:01201073';
    await redis.set(courseCacheKey, JSON.stringify({ title: 'Du lieu NoSQL', credits: 2 }), 'EX', 3600);
    const cachedCourse = await redis.get(courseCacheKey);
    console.log(`Data lay tu cache '${courseCacheKey}':`, JSON.parse(cachedCourse));

    console.log('\n=== HOAN THANH KIEM TRA CAC TINH NANG REDIS THEO DUNG SRS ===');
  } catch (err) {
    console.error('Loi Redis:', err.message);
  } finally {
    redis.disconnect();
  }
}

if (require.main === module) {
  demoRedisOperations();
}

module.exports = { demoRedisOperations };

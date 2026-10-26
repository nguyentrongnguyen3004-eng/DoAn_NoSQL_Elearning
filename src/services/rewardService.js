const { redisClient } = require('../config/db');
const { db, id, fail } = require('./member2Common');
const ITEMS = [
  { _id: 'streak_freeze', name: 'Thẻ Streak Freeze', cost: 500 },
  { _id: 'vip_avatar', name: 'Khung Avatar VIP', cost: 300 },
  { _id: 'writing_deep', name: 'Chấm Writing chuyên sâu', cost: 400 },
  { _id: 'ielts_mock_pro', name: 'Vé IELTS Mock Test Pro', cost: 600 }
];
async function seedItems() {
  for (const item of ITEMS) await db().collection('reward_items').updateOne({ _id: item._id }, { $setOnInsert: item }, { upsert: true });
}
async function wallet(userId) {
  const key = id(userId);
  // Preserve an existing balance. New wallets start at zero, without fabricated XP.
  await db().collection('users').updateOne({ _id: key, xp: { $exists: false } }, { $set: { xp: 0 } });
  await db().collection('users').updateOne({ _id: key, inventory: { $exists: false } }, { $set: { inventory: [] } });
  const user = await db().collection('users').findOne({ _id: key });
  if (!user) fail(404, 'Tài khoản không tồn tại.');
  return user;
}
// Vietnam calendar day, stable across server timezones and year boundaries.
const dayNumber = (now = Date.now()) => Math.floor((now + 7 * 3600000) / 86400000);
async function checkIn(userId) {
  const day = dayNumber();
  const key = `streak:${userId}`;
  let user = await wallet(userId);
  let saved = false;
  if (user.lastStudyDay !== day) {
    const previous = user.lastStudyDay;
    let yesterdayBit = null;
    if (redisClient.status === 'ready') {
      try { yesterdayBit = await redisClient.getbit(key, day - 1); } catch (e) { console.warn('Read streak bitmap:', e.message); }
    }
    const alreadyProtected = previous === day - 2 && yesterdayBit === 1;
    const hasFreeze = (user.inventory || []).some(item => item.itemId === 'streak_freeze');
    const useFreeze = previous === day - 2 && !alreadyProtected && hasFreeze;
    const streak = previous === day - 1 ? (user.streakDays || 0) + 1 : (useFreeze || alreadyProtected) ? (user.streakDays || 0) + 2 : 1;
    const inventory = [...(user.inventory || [])];
    if (useFreeze) inventory.splice(inventory.findIndex(i => i.itemId === 'streak_freeze'), 1);
    const filter = { _id: id(userId), lastStudyDay: previous === undefined ? { $exists: false } : previous, inventory: user.inventory };
    const next = await db().collection('users').findOneAndUpdate(filter, { $set: { lastStudyDay: day, streakDays: streak, inventory, freezeSavedDay: useFreeze ? day : null }, $inc: { xp: 25 } }, { returnDocument: 'after' });
    if (!next) return checkIn(userId); // Concurrent purchase/check-in: re-read before consuming.
    user = next; saved = useFreeze;
  }
  // MongoDB's conditional update prevents double spending; replay repairs Redis after an outage.
  if (redisClient.status === 'ready') {
    try {
      const streak = Math.max(1, user.streakDays || 1);
      for (let offset = day - streak + 1; offset <= day; offset++) await redisClient.setbit(key, offset, 1);
    } catch (e) { console.warn('Streak bitmap:', e.message); }
  }
  return { user, streakSavedByFreeze: saved };
}
async function redeem(userId, itemId) {
  await wallet(userId); await seedItems();
  if (typeof itemId !== 'string') fail(400, 'Vật phẩm không hợp lệ.');
  const item = await db().collection('reward_items').findOne({ _id: itemId });
  if (!item) fail(404, 'Vật phẩm không tồn tại.');
  const user = await db().collection('users').findOneAndUpdate({ _id: id(userId), xp: { $gte: item.cost } }, {
    $inc: { xp: -item.cost }, $push: { inventory: { itemId, name: item.name, acquiredAt: new Date() } }
  }, { returnDocument: 'after' });
  if (!user) fail(400, 'Bạn không đủ XP để đổi quà.');
  return { xp: user.xp, inventory: user.inventory };
}
module.exports = { ITEMS, seedItems, wallet, dayNumber, checkIn, redeem };

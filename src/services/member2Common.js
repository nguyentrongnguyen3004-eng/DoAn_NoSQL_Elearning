const { ObjectId } = require('mongodb');
const { getMongoDb, redisClient } = require('../config/db');
function fail(status, message) { throw Object.assign(new Error(message), { status }); }
function db() { const value = getMongoDb(); if (!value) fail(503, 'MongoDB chưa sẵn sàng.'); return value; }
function id(value) { if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value)) fail(400, 'Mã dữ liệu không hợp lệ.'); return new ObjectId(value); }
function text(value, name, max = 5000) { if (typeof value !== 'string' || !value.trim() || value.length > max || /[<>]/.test(value)) fail(400, `${name} không hợp lệ.`); return value.trim(); }
const wrap = fn => async (req, res) => { try { await fn(req, res); } catch (e) { if (!e.status) console.error('[Member 2]', e); res.status(e.status || 500).json({ success: false, message: e.status ? e.message : 'Không thể xử lý yêu cầu. Vui lòng thử lại.' }); } };
async function cacheDelete(...keys) { if (redisClient.status === 'ready') await redisClient.del(...keys); }
module.exports = { fail, db, id, text, wrap, cacheDelete };

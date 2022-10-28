// @ts-check
const e = require('express');
const express = require('express');
const router = express.Router();
const mongoClient = require('./mongo');
// login 가져다 써야함
const login = require('./login');
// 글 전체 목록 조회
router.get('/', login.isLogin, async (req, res) => {
  console.log(req.user);
  const client = await mongoClient.connect();
  const cursor = client.db('kdt1').collection('board');
  const ARTICLE = await cursor.find({}).toArray();
  const articleLen = ARTICLE.length;
  res.render('board', {
    ARTICLE,
    articleCounts: articleLen,
    userId: req.session.userId
      ? req.session.userId
      : req.user?.id
      ? req.user?.id
      : req.signedCookies.user,
  });
});
// 글쓰기 모드로 이동
router.get('/write', login.isLogin, async (req, res) => {
  res.render('board_write');
});
// 글 추가 기능 수행
router.post('/write', login.isLogin, async (req, res) => {
  if (req.body.title && req.body.content) {
    const newArticle = {
      id: req.session.userId ? req.session.userId : req.user.id,
      title: req.body.title,
      content: req.body.content,
    };
    const client = await mongoClient.connect();
    const cursor = client.db('kdt1').collection('board');
    await cursor.insertOne(newArticle);
    res.redirect('/board');
  } else {
    const err = new Error('데이터가 없습니다');
    err.statusCode = 404;
    throw err;
  }
});
// 글 수정 모드로 이동
router.get('/modify/title/:title', login.isLogin, async (req, res) => {
  const client = await mongoClient.connect();
  const cursor = client.db('kdt1').collection('board');
  const selectedArticle = await cursor.findOne({ title: req.params.title });
  res.render('board_modify', { selectedArticle });
});
// 글 수정 기능 수행
router.post('/modify/title/:title', login.isLogin, async (req, res) => {
  if (req.body.title && req.body.content) {
    const client = await mongoClient.connect();
    const cursor = client.db('kdt1').collection('board');
    await cursor.updateOne(
      { title: req.params.title },
      { $set: { title: req.body.title, content: req.body.content } }
    );
    res.redirect('/board');
  } else {
    const err = new Error('요청 값이 없습니다.');
    err.statusCode = 404;
    throw err;
  }
});
// 글 삭제 기능 수행
router.delete('/delete/title/:title', login.isLogin, async (req, res) => {
  const client = await mongoClient.connect();
  const cursor = client.db('kdt1').collection('board');
  const result = await cursor.deleteOne({ title: req.params.title });
  if (result.acknowledged) {
    res.send('삭제 완료');
  } else {
    const err = new Error('삭제 실패');
    err.statusCode = 404;
    throw err;
  }
});
module.exports = router;

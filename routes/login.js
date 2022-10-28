// @ts-check

const express = require('express');

const passport = require('passport');

// const mongoClient = require('./mongo');

const router = express.Router();

const isLogin = (req, res, next) => {
  if (req.session.login || req.user || req.signedCookies.user) {
    next();
  } else {
    // 로그인 안하고 게시판 바로가기 눌렀을 때
    res.status(300);
    res.send(
      '로그인이 필요한 서비스입니다.<br><a href="/login">로그인 페이지로 이동</a><br><a href="/login">메인 페이지로 이동</a>'
    );
  }
};

router.get('/', (req, res) => {
  res.render('login');
});

router.post('/', async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    console.log(req.user);
    if (err) throw err;
    if (!user) {
      return res.send(
        `${info.message}<br><a href="/login"> 로그인 페이지로 이동 </a>'`
      );
    }
    req.logIn(user, (err) => {
      if (err) throw err;
      res.cookie('user', req.body.id, {
        expires: new Date(Date.now() + 1000 * 60),
        httpOnly: true,
        signed: true,
        // 60초동안, http에서만, 암호화 되어있다
      });
      res.redirect('/board');
    });
  })(req, res, next);
});

//
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.redirect('/');
  });
});

// const client = await mongoClient.connect();
// const userCursor = client.db('kdt1').collection('user');
// const idResult = await userCursor.findOne({ id: req.body.id });

// if (idResult !== null) {
//   if (idResult.password === req.body.password) {
//     // 로그인 성공한 시점에 session.login을 통해 확인 가능
//     req.session.login = true;
//     req.session.userId = req.body.id;
//     res.redirect('/board');
//   } else {
//     res.status(300);
//     res.send(
//       '비밀번호가 틀렸습니다.<br><a href="/login">로그인 페이지로 이동</a>'
//     );
//   }
// } else {
//   res.status(300);
//   res.send('해당 id가 없습니다. <br><a href="/login">로그인 페이지로 이동</a>');
// }

// router.get('/logout', (req, res) => {
//   req.session.destroy((err) => {
//     if (err) throw err;
//     res.redirect('/');
//   });
// });

router.get('/auth/naver', passport.authenticate('naver'));

router.get(
  '/auth/naver/callback',
  passport.authenticate('naver', {
    successRedirect: '/board',
    failureRedirect: '/',
  })
);

module.exports = { router, isLogin };

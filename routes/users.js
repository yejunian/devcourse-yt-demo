const express = require('express');
const router = express.Router();

router.use(express.json());

/** @type {Map<string, { userID: string, password: string, name: string }>} */
const users = new Map();

router.post('/login', (req, res) => {
  const { userID, password } = req.body || {};

  if (!userID) {
    res.status(400).json({ message: '아이디를 입력하세요.' });
    return;
  } else if (!password) {
    res.status(400).json({ message: '비밀번호를 입력하세요.' });
    return;
  }

  const user = users.get(userID);
  const success = user && userID === user.userID && password === user.password;

  if (!success) {
    res
      .status(401)
      .json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    return;
  }

  res.status(200).json({ message: `${user.name}님 환영합니다.` });
});

router.post('/users', (req, res) => {
  const { userID, password, name } = req.body || {};

  if (!userID) {
    res.status(400).json({ message: '아이디를 입력하세요.' });
    return;
  } else if (!password) {
    res.status(400).json({ message: '비밀번호를 입력하세요.' });
    return;
  } else if (!name) {
    res.status(400).json({ message: '이름을 입력하세요.' });
    return;
  }

  if (users.get(userID)) {
    res.status(400).json({ message: '동일한 아이디가 이미 존재합니다.' });
    return;
  }

  users.set(userID, { userID, password, name });

  res.status(201).json({ message: `${name}님 환영합니다.` });
});

router
  .route('/users')

  .get((req, res) => {
    const user = users.get(req.body.userID);

    if (!user) {
      res.status(404).json({ message: '사용자 아이디가 존재하지 않습니다.' });
      return;
    }

    res.status(200).json({
      userID: user.userID,
      name: user.name,
    });
  })

  .delete((req, res) => {
    const { userID, password } = req.body ?? {};

    if (!userID) {
      res.status(400).json({ message: '아이디를 입력하세요.' });
      return;
    } else if (!password) {
      res.status(400).json({ message: '비밀번호를 입력하세요.' });
      return;
    }

    const user = users.get(userID);
    const success =
      user && userID === user.userID && password === user.password;

    if (!success) {
      res
        .status(400)
        .json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
      return;
    }

    users.delete(userID);

    res.status(200).json({ message: `${user.name}님 언젠가 다시 만나요.` });
  });

module.exports = router;

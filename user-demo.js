const express = require('express');
const app = express();
app.listen(7777);
app.use(express.json());

/** @type {Map<number, { userID: string, password: string, name: string }>} */
const users = new Map();
let id = 1;

function findUser(userID) {
  for (const [key, user] of users) {
    if (user.userID === userID) {
      return [key, user];
    }
  }

  return [];
}

app.post('/login', (req, res) => {
  const { userID, password } = req.body || {};

  if (!userID) {
    res.status(400).json({ message: '아이디를 입력하세요.' });
    return;
  } else if (!password) {
    res.status(400).json({ message: '비밀번호를 입력하세요.' });
    return;
  }

  const [, user] = findUser(userID);
  const success = user && userID === user.userID && password === user.password;

  if (!success) {
    res
      .status(401)
      .json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    return;
  }

  res.status(200).json({ message: `${user.name}님 환영합니다.` });
});

app.post('/users', (req, res) => {
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

  const [, foundUserID] = findUser(userID);

  if (foundUserID) {
    res.status(400).json({ message: '동일한 아이디가 이미 존재합니다.' });
    return;
  }

  users.set(id++, { userID, password, name });

  res.status(201).json({ message: `${name}님 환영합니다.` });
});

app
  .route('/users/:userID')

  .get((req, res) => {
    const { userID } = req.params;
    const [, user] = findUser(req.params.userID);

    if (!user) {
      res
        .status(404)
        .json({ message: `${userID}는 존재하지 않는 아이디입니다.` });
      return;
    }

    res.json({
      userID: user.userID,
      name: user.name,
    });
  })

  .delete((req, res) => {
    const { userID } = req.params;
    const { password } = req.body ?? {};

    if (!userID) {
      res.status(400).json({ message: '아이디를 입력하세요.' });
      return;
    } else if (!password) {
      res.status(400).json({ message: '비밀번호를 입력하세요.' });
      return;
    }

    const [dbID, user] = findUser(userID);
    const success =
      user && userID === user.userID && password === user.password;

    if (!success) {
      res
        .status(400)
        .json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
      return;
    }

    users.delete(dbID);

    res.json({ message: `${user.name}님 언젠가 다시 만나요.` });
  });

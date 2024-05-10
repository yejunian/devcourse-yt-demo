const express = require('express');
const router = express.Router();

const conn = require('../mariadb');

router.use(express.json());

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email) {
    res.status(400).json({ message: '이메일을 입력하세요.' });
    return;
  } else if (!password) {
    res.status(400).json({ message: '비밀번호를 입력하세요.' });
    return;
  }

  // 여기서 이메일+비밀번호를 한번에 검사하나, 아니면 이메일로 비밀번호를 가져오나?
  const sql = 'SELECT `name` FROM `users` WHERE `email` = ? AND `password` = ?';
  const values = [email, password];
  conn.query(sql, values, (err, results) => {
    if (!results?.length) {
      res
        .status(401)
        .json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
      return;
    }

    res.status(200).json({ message: `${results[0].name}님 환영합니다.` });
  });
});

router
  .route('/users')

  .get((req, res) => {
    const { email } = req.body || {};

    const sql = 'SELECT * FROM `users` WHERE `email` = ?';
    const values = [email];
    conn.query(sql, values, (err, results) => {
      if (!results.length) {
        res.status(404).json({ message: '사용자 이메일이 존재하지 않습니다.' });
        return;
      }

      res.status(200).json(results[0]);
    });
  })

  .post((req, res) => {
    const { email, name, password, contact } = req.body || {};

    if (!email) {
      res.status(400).json({ message: '이메일을 입력하세요.' });
      return;
    } else if (!name) {
      res.status(400).json({ message: '이름을 입력하세요.' });
      return;
    } else if (!password) {
      res.status(400).json({ message: '비밀번호를 입력하세요.' });
      return;
    }

    const sql =
      'INSERT INTO `users` (`email`, `name`, `password`, `contact`) VALUES (?, ?, ?, ?)';
    const values = [email, name, password, contact || null];
    conn.query(sql, values, (err) => {
      if (err) {
        res.status(400).json({ message: '이미 가입한 이메일입니다.' });
        return;
      }

      res.status(201).json({ message: `${name}님 환영합니다.` });
    });
  })

  .delete((req, res) => {
    const { email, password } = req.body || {};

    if (!email) {
      res.status(400).json({ message: '이메일을 입력하세요.' });
      return;
    } else if (!password) {
      res.status(400).json({ message: '비밀번호를 입력하세요.' });
      return;
    }

    const sql = 'DELETE FROM `users` WHERE `email` = ? AND `password` = ?';
    const values = [email, password];
    conn.query(sql, values, (err, results) => {
      if (!results?.affectedRows) {
        res
          .status(400)
          .json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
        return;
      }

      res.status(200).json({ message: '언젠가 다시 만나요.' });
    });
  });

module.exports = router;

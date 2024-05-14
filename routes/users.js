const dotenv = require('dotenv');
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const conn = require('../mariadb');

dotenv.config();

const router = express.Router();
router.use(express.json());

const validate = (req, res, next) => {
  const err = validationResult(req);

  if (err.isEmpty()) {
    return next();
  } else {
    return res.status(400).json(err.array());
  }
};

router.post(
  '/login',
  [
    body('email')
      .notEmpty()
      .withMessage('이메일을 입력하세요.')
      .isEmail()
      .withMessage('이메일을 형식에 맞게 입력하세요.'),
    body('password')
      .notEmpty()
      .withMessage('비밀번호를 입력하세요.')
      .isString()
      .withMessage('비밀번호를 문자열로 입력하세요.'),
    validate,
  ],
  (req, res) => {
    const { email, password } = req.body;

    // 여기서 이메일+비밀번호를 한번에 검사하나, 아니면 이메일로 비밀번호를 가져오나?
    const sql =
      'SELECT `name` FROM `users` WHERE `email` = ? AND `password` = ?';
    const values = [email, password];
    conn.query(sql, values, (err, results) => {
      if (err) {
        return res.status(500).end();
      }

      const user = results[0];

      if (results?.length) {
        const token = jwt.sign(
          {
            email: user.email,
            name: user.name,
          },
          process.env.JWT_SECRET
        );

        return res.status(200).json({
          token, // TODO - 내일 강의 내용: Body 말고 쿠키에 실어서 보내기
          message: `${results[0].name}님 환영합니다.`,
        });
      } else {
        return res.status(404).json({
          message: '이메일 또는 비밀번호가 일치하지 않습니다.',
        });
      }
    });
  }
);

router
  .route('/users')

  .get(
    [
      body('email')
        .notEmpty()
        .withMessage('이메일을 입력하세요.')
        .isEmail()
        .withMessage('이메일을 형식에 맞게 입력하세요.'),
      validate,
    ],
    (req, res) => {
      const { email } = req.body;

      const sql = 'SELECT * FROM `users` WHERE `email` = ?';
      const values = [email];
      conn.query(sql, values, (err, results) => {
        if (err) {
          return res.status(500).end();
        }

        if (results?.length) {
          return res.status(200).json(results[0]);
        } else {
          return res.status(404).json({
            message: '사용자 이메일이 존재하지 않습니다.',
          });
        }
      });
    }
  )

  .post(
    [
      body('email')
        .notEmpty()
        .withMessage('이메일을 입력하세요.')
        .isEmail()
        .withMessage('이메일을 형식에 맞게 입력하세요.'),
      body('name')
        .notEmpty()
        .withMessage('이름을 입력하세요.')
        .isString()
        .withMessage('이름을 문자열로 입력하세요.'),
      body('password')
        .notEmpty()
        .withMessage('비밀번호를 입력하세요.')
        .isString()
        .withMessage('비밀번호를 문자열로 입력하세요.'),
      body('contact')
        .optional()
        .isString()
        .withMessage('연락처를 문자열로 입력하세요.'),
      validate,
    ],
    (req, res) => {
      const { email, name, password, contact } = req.body;

      const sql =
        'INSERT INTO `users` (`email`, `name`, `password`, `contact`) VALUES (?, ?, ?, ?)';
      const values = [email, name, password, contact || null];
      conn.query(sql, values, (err) => {
        if (err) {
          return res.status(400).json({ message: '이미 가입한 이메일입니다.' });
        }

        res.status(201).json({ message: `${name}님 환영합니다.` });
      });
    }
  )

  .delete(
    [
      body('email')
        .notEmpty()
        .withMessage('이메일을 입력하세요.')
        .isEmail()
        .withMessage('이메일을 형식에 맞게 입력하세요.'),
      body('password')
        .notEmpty()
        .withMessage('비밀번호를 입력하세요.')
        .isString()
        .withMessage('비밀번호를 문자열로 입력하세요.'),
      validate,
    ],
    (req, res) => {
      const { email, password } = req.body;

      const sql = 'DELETE FROM `users` WHERE `email` = ? AND `password` = ?';
      const values = [email, password];
      conn.query(sql, values, (err, results) => {
        if (err) {
          return res.status(500).end();
        }

        if (results?.affectedRows) {
          return res.status(200).json({
            message: '언젠가 다시 만나요.',
          });
        } else {
          return res.status(404).json({
            message: '이메일 또는 비밀번호가 일치하지 않습니다.',
          });
        }
      });
    }
  );

module.exports = router;

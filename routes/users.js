const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');

const envConfig = require('../config/env');
const conn = require('../mariadb');
const validate = require('../middlewares/validate');

const router = express.Router();
router.use(express.json());

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

    const sql =
      'SELECT `email`, `name` FROM `users` WHERE `email` = ? AND `password` = ?';
    const values = [email, password];
    conn.query(sql, values, (err, results) => {
      if (err) {
        return res.status(500).end();
      }

      const user = results[0];

      if (results?.length) {
        const token = jwt.sign(
          { email: user.email, name: user.name },
          envConfig.jwt.secret,
          { expiresIn: '1m', issuer: 'yejunian' }
        );

        res.cookie('token', token, { httpOnly: true });

        return res.status(200).json({
          message: `${results[0].name}님 환영합니다.`,
        });
      } else {
        return res.status(403).json({
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

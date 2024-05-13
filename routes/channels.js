const express = require('express');
const { body, param, validationResult } = require('express-validator');

const conn = require('../mariadb');

const router = express.Router();
router.use(express.json());

const validate = (req, res, next) => {
  const err = validationResult(req);

  if (err.isEmpty()) {
    next();
  } else {
    res.status(400).json(err.array());
  }
};

router
  .route('/')

  .get(
    body('userID')
      .notEmpty()
      .withMessage('userID를 입력하세요.')
      .isInt()
      .withMessage('userID를 숫자로 입력하세요.'),
    validate,
    (req, res) => {
      const userID = parseInt(req.body.userID);

      const sql = 'SELECT * FROM `channels` WHERE `user_id` = ?';
      const values = [userID];
      conn.query(sql, values, (err, results) => {
        if (err) {
          return res.status(500).end();
        }

        if (results?.length) {
          res.status(200).json(results);
        } else {
          return notFoundChannel(res);
        }
      });
    }
  )

  .post(
    body('userID')
      .notEmpty()
      .withMessage('userID를 입력하세요.')
      .isInt()
      .withMessage('userID를 숫자로 입력하세요.'),
    body('name')
      .notEmpty()
      .withMessage('채널 이름 name을 입력하세요.')
      .isString()
      .withMessage('채널 이름 name을 문자열로 입력하세요.'),
    validate,
    (req, res) => {
      const err = validationResult(req);

      if (!err.isEmpty()) {
        return res.status(400).json(err.array());
      }

      const { name } = req.body;
      const userID = parseInt(req.body.userID);

      const sql = 'INSERT INTO `channels` (`name`, `user_id`) VALUES (?, ?)';
      const values = [name, userID];
      conn.query(sql, values, (err) => {
        if (err) {
          switch (err.errno) {
            case 1452:
              return res.status(400).json({
                message: '사용자가 존재하지 않습니다.',
              });

            default:
              return res.status(500).end();
          }
        }

        res.status(201).json({
          message: `${name} 채널의 성장을 응원합니다.`,
        });
      });
    }
  );

router
  .route('/:id')

  .get(
    param('id')
      .notEmpty()
      .withMessage('채널 id를 입력하세요.')
      .matches(/^[0-9]+$/)
      .withMessage('채널 id를 숫자로 입력하세요.'),
    validate,
    (req, res) => {
      const err = validationResult(req);

      if (!err.isEmpty()) {
        return res.status(400).json(err.array());
      }

      const id = parseInt(req.params.id);

      const sql = 'SELECT * FROM `channels` WHERE `id` = ?';
      const value = [id];
      conn.query(sql, value, (err, result) => {
        if (err) {
          return res.status(500).end();
        }

        if (result?.length) {
          res.status(200).json(result[0]);
        } else {
          notFoundChannel(res);
        }
      });
    }
  )

  .put(
    param('id')
      .notEmpty()
      .withMessage('채널 id를 입력하세요.')
      .matches(/^[0-9]+$/)
      .withMessage('채널 id를 숫자로 입력하세요.'),
    body('name')
      .notEmpty()
      .withMessage('채널명을 입력하세요.')
      .isString()
      .withMessage('채널명을 문자열로 입력하세요.'),
    validate,
    (req, res) => {
      const id = parseInt(req.params.id);
      const { name } = req.body;

      const sql = 'UPDATE `channels` SET `name` = ? WHERE `id` = ?';
      const values = [name, id];
      conn.query(sql, values, (err, results) => {
        if (err) {
          return res.status(500).end();
        }

        if (results.changedRows) {
          res.status(200).json({
            message: `채널 이름을 ${name}으로 변경했습니다.`,
          });
        } else if (results.affectedRows) {
          res.status(400).json({
            message: '현재 채널 이름과 다른 이름을 입력하세요.',
          });
        } else {
          notFoundChannel(res);
        }
      });
    }
  )

  .delete(
    param('id')
      .notEmpty()
      .withMessage('채널 id를 입력하세요.')
      .matches(/^[0-9]+$/)
      .withMessage('채널 id를 숫자로 입력하세요.'),
    validate,
    (req, res) => {
      const err = validationResult(req);

      if (!err.isEmpty()) {
        return res.status(400).json(err.array());
      }

      const id = parseInt(req.params.id);

      const sql = 'DELETE FROM `channels` WHERE `id` = ?';
      const values = [id];
      conn.query(sql, values, (err, results) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (results.affectedRows) {
          res.status(200).json({ message: '채널을 삭제했습니다.' });
        } else {
          notFoundChannel(res);
        }
      });
    }
  );

function notFoundChannel(res) {
  res.status(404).json({
    message: '채널 정보를 찾을 수 없습니다.',
  });
}

module.exports = router;

const express = require('express');
const router = express.Router();

const conn = require('../mariadb');

router.use(express.json());

// TODO - 인메모리 DB를 외부 DB로 교체 (PUT /:id, DELETE /:id)
/** @type {Map<number, { title: string, userID: string }>} */
const channels = new Map();
let id = 1;

router
  .route('/')

  .get((req, res) => {
    const userID = parseInt(req.body.userID);

    if (isNaN(userID)) {
      res.status(400).json({
        message: '사용자 정보가 올바르지 않습니다.',
      });
      return;
    }

    const sql = 'SELECT * FROM `channels` WHERE `user_id` = ?';
    const values = [userID];
    conn.query(sql, values, (err, results) => {
      if (!results?.length) {
        notFoundChannel(res);
        return;
      }

      res.status(200).json(results);
    });
  })

  .post((req, res) => {
    const { name } = req.body || {};
    const userID = parseInt(req.body.userID);

    if (!name || isNaN(userID)) {
      res
        .status(400)
        .json({ message: '채널 이름과 사용자 아이디를 입력하세요.' });
      return;
    }

    const sql = 'INSERT INTO `channels` (`name`, `user_id`) VALUES (?, ?)';
    const values = [name, userID];
    conn.query(sql, values, (err, results) => {
      if (err) {
        switch (err.errno) {
          case 1452:
            res.status(400).json({
              message: '사용자가 존재하지 않습니다.',
            });
            return;

          default:
            res.status(500).json({
              message: '서버 내부 오류',
            });
            return;
        }
      }

      res.status(201).json({
        message: `${name} 채널의 성장을 응원합니다.`,
      });
    });
  });

router
  .route('/:id')

  .get((req, res) => {
    const id = parseInt(req.params.id);

    const sql = 'SELECT * FROM `channels` WHERE `id` = ?';
    const value = [id];
    conn.query(sql, value, (err, result) => {
      if (!result?.length) {
        notFoundChannel(res);
        return;
      }

      res.status(200).json(result[0]);
    });
  })

  // TODO - 인메모리 DB를 외부 DB로 교체
  .put((req, res) => {
    const id = parseInt(req.params.id);
    const { title } = req.body || {};
    const oldChannel = channels.get(id);

    if (!oldChannel) {
      notFoundChannel(res);
      return;
    }

    if (!title) {
      res.status(400).json({
        message: '새 채널 이름을 입력하세요.',
      });
      return;
    }

    if (title === oldChannel.title) {
      res.status(400).json({
        message: `현재 채널 이름 ${title}과(와) 다른 이름을 입력하세요.`,
      });
      return;
    }

    channels.set(id, { ...oldChannel, title });
    res.status(200).json({
      message: `${oldChannel.title} 채널 이름을 ${title}(으)로 변경했습니다.`,
    });
  })

  // TODO - 인메모리 DB를 외부 DB로 교체
  .delete((req, res) => {
    const id = parseInt(req.params.id);
    const channel = channels.get(id);

    if (channel) {
      channels.delete(id);
      res.status(200).json({
        message: `${channel.title} 채널을 삭제했습니다.`,
      });
    } else {
      notFoundChannel(res);
    }
  });

function notFoundChannel(res) {
  res.status(404).json({
    message: '채널 정보를 찾을 수 없습니다.',
  });
}

module.exports = router;

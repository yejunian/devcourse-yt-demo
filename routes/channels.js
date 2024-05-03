const express = require('express');
const router = express.Router();

router.use(express.json());

/** @type {Map<number, { title: string, userID: string }>} */
const channels = new Map();
let id = 1;

router
  .route('/')

  .get((req, res) => {
    const { userID } = req.body || {};

    if (!userID) {
      res.status(401).json({
        message: '로그인이 필요합니다.',
      });
      return;
    }

    if (!channels.size) {
      notFoundChannel(res);
      return;
    }

    let allChannels = [];

    channels.forEach((channel) => {
      if (channel.userID === userID) {
        allChannels.push(channel);
      }
    });

    if (!allChannels.length) {
      notFoundChannel(res);
      return;
    }

    res.status(200).json(allChannels);
  })

  .post((req, res) => {
    const { title, userID } = req.body || {};

    if (title && userID) {
      channels.set(id++, { title, userID });

      res.status(201).json({
        message: `${title} 채널의 성장을 응원합니다.`,
      });
    } else {
      res
        .status(400)
        .json({ message: '채널 이름과 사용자 아이디를 입력하세요.' });
    }
  });

router
  .route('/:id')

  .get((req, res) => {
    const id = parseInt(req.params.id);
    const channel = channels.get(id);

    if (channel) {
      res.status(200).json(channel);
    } else {
      notFoundChannel(res);
    }
  })

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

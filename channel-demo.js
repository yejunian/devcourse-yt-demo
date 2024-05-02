const express = require('express');
const app = express();
app.listen(7777);
app.use(express.json());

/** @type {Map<number, { title: string }>} */
const channels = new Map();
let id = 1;

app
  .route('/channels')

  .get((req, res) => {
    if (channels.size) {
      const allChannels = Array.from(channels, ([, record]) => record);
      res.status(200).json(allChannels);
    } else {
      res.status(404).json({
        message: '조회할 채널이 하나도 없습니다.',
      });
    }
  })

  .post((req, res) => {
    const { title } = req.body || {};

    if (title) {
      channels.set(id++, { title });

      res.status(201).json({
        message: `${title} 채널의 성장을 응원합니다.`,
      });
    } else {
      res.status(400).json({ message: '채널 이름을 입력하세요.' });
    }
  });

app
  .route('/channels/:id')

  .get((req, res) => {
    const id = parseInt(req.params.id);
    const channel = channels.get(id);

    if (channel) {
      res.status(200).json(channel);
    } else {
      res.status(404).json({
        message: `${id}번 채널 정보를 찾을 수 없습니다.`,
      });
    }
  })

  .put((req, res) => {
    const id = parseInt(req.params.id);
    const { title } = req.body || {};
    const oldChannel = channels.get(id);

    if (!oldChannel) {
      res.status(404).json({
        message: `${id}번 채널 정보를 찾을 수 없습니다.`,
      });
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
      res.status(404).json({
        message: `${id}번 채널 정보를 찾을 수 없습니다.`,
      });
    }
  });

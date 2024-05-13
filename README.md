# 프로그래머스 풀스택 데브코스 — 미니 프로젝트 실습 결과물

> #### 데브코스 수강 정보
>
> * 타입스크립트로 함께하는 웹 풀 사이클 개발(React, Node.js) 3기
> * https://school.programmers.co.kr/learn/courses/22464

---

## 2024-05-13

사용자가 입력한 값이 올바른지 확인하는 과정이 **유효성 검사(validation)**이다. 지금까지는 유효성 검사를 직접 하느라, 유효성 검사와 데이터 추가·조회·수정·삭제가 뒤섞여서 코드가 복잡해졌다.

`express-validator`라는 Express 미들웨어는 간단한 형태로 유효성 검사를 할 수 있는 API를 제공한다. 이를 활용하여 유효성 검사를 하도록 수정했더니, 모든 핸들러 초반부에 공통적인 유효성 검사 분기문이 생겼다. 이 부분을 별도의 미들웨어 함수로 추출하여 `validation`이라고 이름을 붙였다.

오늘 강의 내용은 여기까지였고, 여기까지만 하면 제대로 작동하지 않는다. 그 다음 어떻게 해야 하는지는 내일 강의에서 다룬다. 작동하지 않는 상태로 끊기에는 마음에 내키지가 않아서, 내일 강의를 수강하기 전에 먼저 딱 한 발자국만 더 나아가 보았다.

Express에서는 한 루트에 핸들러 여러 개를 연결할 수 있는데, 앞의 핸들러에서 (세 번째 파라미터인) `next()` 함수를 호출하면 그 지점에서 다음 핸들러 함수를 실행한다. 이 점을 이용하여 URL 요청에 전·후처리 과정을 추가할 수 있다. `express-validator`도 같은 원리다.

추출한 `validation()` 함수에 `next`라는 세 번째 파라미터를 추가하고, 유효성 검사를 통과한 분기에서 `next()`를 호출하도록 수정했다.

---

## 2024-05-10

외부 DB를 연동하니, 점점 구성이 갖춰져 가는 것 같다.

### 질문

이메일+비밀번호를 조건에 함께 넣어서 조회하기 vs 이메일로 비밀번호를 가져와서 검사하기

```javascript
// 이메일+비밀번호를 조건에 함께 넣어서 조회하기
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  // ...
  const sql = 'SELECT `name` FROM `users` WHERE `email` = ? AND `password` = ?';
  const values = [email, password];
  conn.query(sql, values, (err, results) => {
    if (!results?.length) {
      res
        .status(401)
        .json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
      return;
    }

    res.status(200).json({ message: `${results[0].name}님 환영합니다.` });
  });
});
```

```javascript
// 이메일로 비밀번호를 가져와서 검사하기
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  // ...
  const sql = 'SELECT `name`, `password` FROM `users` WHERE `email` = ?';
  const values = [email];
  conn.query(sql, values, (err, results) => {
    if (!results?.length || results[0].password !== password) {
      res
        .status(401)
        .json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
      return;
    }

    res.status(200).json({ message: `${results[0].name}님 환영합니다.` });
  });
});
```

어느 쪽이 나을까?

---

## 2024-05-03

`if`가 많이 중첩되는 부분은 강사님께서 잠깐 설명하신 early return으로 중첩을 풀었다. 이전에 찾아보았듯이, if에 부정 조건이 들어가더라도 보호 절(guard clause)을 적용하여 중첩을 없애는 쪽이 낫다고 한다.

> 이전 노트 참고: [if에 긍정 조건 넣기](https://github.com/yejunian/devcourse-node-base/tree/963545ed21fd372a8ff40f3226e3848f485051b5#if%EC%97%90-%EA%B8%8D%EC%A0%95-%EC%A1%B0%EA%B1%B4-%EB%84%A3%EA%B8%B0)

---

## 2024-05-02

채널 전체 조회 부분에서 빈 배열을 만들고 `push()` 메서드를 쓰는 대신에, 아래와 같이 한번에 만들어 보았다.

```javascript
/** @type {Map<number, { title: string }>} */
const channels = new Map();
// ...
app
  .route('/channels')
  .get((req, res) => {
    if (channels.size) {
      const allChannels = Array.from(channels, ([, record]) => record);
      res.status(200).json(allChannels);
// ...
```

---

## 2024-05-01

> #### Express 실습 내용
>
> * [학습 완료 시점의 코드 보기](https://github.com/yejunian/devcourse-node-base/tree/963545ed21fd372a8ff40f3226e3848f485051b5)
> * [추가 학습 내용(README) 보기](https://github.com/yejunian/devcourse-node-base/blob/963545ed21fd372a8ff40f3226e3848f485051b5/README.md#2024-05-01)

스스로 생각하는 능력을 기르기 위해, 앞서 진행한 API 설계를 바탕으로 먼저 코드를 작성해 보았다. 그 다음 강의를 계속 수강하고 필요하다고 생각하는 부분을 수정했다. 강의에서 아직 작성하지 않은 로그인 부분도 임의로 작성해 보았다.

# 프로그래머스 풀스택 데브코스 — 미니 프로젝트 실습 결과물

> #### 데브코스 수강 정보
>
> * 타입스크립트로 함께하는 웹 풀 사이클 개발(React, Node.js) 3기
> * https://school.programmers.co.kr/learn/courses/22464

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

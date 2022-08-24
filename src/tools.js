export const getRandom = (n, m) => {
  return Math.floor(Math.random() * (m - n + 1)) + n
}

export const getMemberId = (context) => {
  return context?.getDisplayer()?.observerId;
}

export const getMemberList = (context) => {
  const res = [];

  // 排除老师
  context?.getDisplayer()?.state?.roomMembers?.map((memebr) => {
    if (memebr.memberId !== getMemberId(context)) {
      res.push(memebr.memberId);
    }
  }) || [];

  return res;
}

export const createElement = ({ type, classList = [], innerHTML }) => {

  if (!type) {
    return;
  }

  const el = document.createElement(type);

  classList.forEach(i => {
    el.classList.add(i)
  });

  if (innerHTML) {
    el.innerHTML = innerHTML;
  }
  return el;
}

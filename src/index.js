/// <reference types="vite/client" />
import { getRandom, getMemberId, getMemberList, createElement } from "./tools";
import styles from "./style.css?inline";

/**
 * Register it before joining room:
 * ```js
 * WindowManager.register({
 *   kind: "Random",
 *   src: Random
 * })
 * ```
 * Then you can use it in your room:
 * ```js
 * manager.addApp({ kind: 'Random' })
 * ```
 * Read more about how to make a netless app here:
 * https://github.com/netless-io/window-manager/blob/master/docs/develop-app.md
 *
 * @type {import("@netless/window-manager").NetlessApp}
 */
const Random = {
  kind: "Random",
  setup(context) {
    const box = context.getBox();
    box.mountStyles(styles);

    const $content = createElement({ type: "div", classList: ["app-random"] });
    box.mountContent($content);

    const $isMe = createElement({ type: "p", classList: ["is-me"], innerHTML: "当前ID： " + getMemberId(context) });
    const $container = createElement({ type: "div", classList: ["name-container"]});
    const $ready = createElement({ type: "div", classList: ["name-list"]});
    $content.appendChild($isMe);
    $content.appendChild($container);
    $container.appendChild($ready);
    
    const $section = createElement({ type: "section" });
    const $btn1 = createElement({ type: "button", classList: ["start"], innerHTML: "开始" })
    const $tip = createElement({ type: "p", classList: ["tip"] });

    $section.appendChild($tip);
    $section.appendChild($btn1);
    $content.appendChild($section);

    const storage = context.createStorage("random", {
      disabled: false,
      result: "",
      teacherId: "",
      preIdx: -1,
      arr: getMemberList(context)
    });

    storage.state.arr.forEach((i, idx) => {
      const el = createElement({ type: "div", classList: ['name-item', `item-${idx}`], innerHTML: i });
      $ready.appendChild(el);
    })

    const start = document.querySelector('.start')

    if (!storage.state.teacherId) {
      storage.setState({ teacherId: getMemberId(context) });
    }

    start.addEventListener('click', () => {
      if (storage.state.arr.length <= 1 ) {
        alert("当前房间只有 1 名学生");
        return;
      }

      if (storage.state.disabled) {
        return;
      }

      if (storage.state.preIdx !== -1) {
        storage.setState({ preIdx: -1 });
      }

      storage.setState({ arr: getMemberList(context)})

      storage.setState({
        result: null,
        disabled: true
      });

      setTimeout(async () => {
        storage.setState({ disabled: false, result: storage.state.arr[getRandom(1, storage.state.arr.length - 1)] })
      }, 5000)
    });

    function refresh(o) {
      if (storage.state.disabled) {
        $ready.classList.add("animation");
        $btn1.classList.add("disabled");
      } else {
        $btn1.classList.remove("disabled");
        $ready.classList.remove("animation");
      }

      if (storage.state.teacherId && storage.state.teacherId !== getMemberId(context)) {
          $section.style.display = "none"
      }

      if (o?.hasOwnProperty("preIdx")) {
        if (o.preIdx.newValue !== -1) {
          const elList = document.getElementsByClassName(`item-${o.preIdx.newValue}`);
          elList[0].classList.add("active");
          elList[0].scrollTo({ top: 0, behavior: "smooth" });
        } else {
          const elList = document.getElementsByClassName(`item-${o.preIdx.oldValue}`);
          elList[0].classList.remove("active");
        }
      }

      if (o?.hasOwnProperty("result")) {
        if (!storage.state.result) {
          $tip.innerHTML = "";
        } else {
          const idx = storage.state.arr.findIndex(i => i == storage.state.result);

          if(idx > -1) {
            const elList = document.getElementsByClassName(`item-${idx}`);
  
            if (elList) {
              storage.setState({ preIdx: idx });
              
              if (getMemberId(context) === storage.state.result) {
                $tip.innerHTML = "抽到你啦！";
              }
            }
          }
        }
      }
    }

    const dispose = storage.addStateChangedListener(refresh);

    refresh();

    context.emitter.on("destroy", () => {
      dispose();
      storage.deleteStorage();
    });
  },
};

export default Random;


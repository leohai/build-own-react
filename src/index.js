let nextUnitOfWork = null

function workLoop(deadline) {
  let shouldYeild = false
  while(nextUnitOfWork && !shouldYeild) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYeild = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop)
}
// 执行任务单元，且返回下一个任务单元
function performUnitOfWork () {
  // TODO
  console.log(333)

}
requestIdleCallback(workLoop)

function render(element, container) {
  // 1创建dom
  const dom =
    element.type == 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type)

  // 添加dom属性
  const isProperty = key => key !== 'children'

   Object.keys(element.props)
     .filter(isProperty)
     .forEach((name) => {
       dom[name] = element.props[name]
     })
  // 递归子节点
  element.props.children.forEach((child) => render(child, dom))
  // 添加到容器
  container.appendChild(dom)
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  }
}



const Didact = {
  createElement,
  render
}

/** @jsx Didact.createElement */
function Counter() {
  const [state, setState] = Didact.useState(1)
  return (
    <h1 onClick={() => setState((c) => c + 1)} style="user-select: none">
      Count: {state}
    </h1>
  )
}
const h1 = <h2 className="ddb">adadada</h2>
// const element = <Counter />
const element = h1
console.log(h1)
const container = document.querySelector('#root')
Didact.render(element, container)
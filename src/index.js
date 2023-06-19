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
function performUnitOfWork (fiber) {
  // 构建dom树
  if(!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  if(fiber.parent) {
    fiber.parent.dom.append(fiber.dom)
  }
  const elements = fiber.props.children
  let index = 0
  let preSibling = null
  // generate child fiber, add parent ,sibling
  while (index < elements.length) {
    const element = elements[index]
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }
    if (index === 0) {
      fiber.child = newFiber
    } else {
      preSibling.sibling = fiber
    }
    preSibling = fiber
    index ++;
  }
  
  // return fiber
  if(fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }

}
requestIdleCallback(workLoop)

function createDom(element) {
  // 1创建dom
  const dom =
    element.type == 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type)

  // 添加dom属性
  const isProperty = (key) => key !== 'children'

  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name]
    })

  return dom
}

function render(element, container) {
  nextUnitOfWork = {
    props: {
      children: [element]
    },
    dom: container
  }
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
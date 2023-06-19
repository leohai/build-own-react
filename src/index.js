let nextUnitOfWork = null
let wipRoot = null // 根fiber树
let currentRoot = null
let deletions = null // 标记需要删除的节点
const isProperty = (key) => key !== 'children'
const isEvent = (key) => key.startsWith('on')
const isGone = (pre, next) => key => !(key in next)
const isNew = (pre, next) => key => next[key] != pre[key]

function commitRoot() {
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber) {
  if(!fiber) return;

  const domParent = fiber.parent.dom
  if(fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  } else if (fiber.effectTag === 'DELETIONS' && fiber.dom != null) {
    domParent.removeChild(fiber.dom)
  } 
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}
function updateDom(dom, prevProps, nextProps) {
  // remove , update listener
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.removeListener(eventType, prevProps[name])
    })

  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((key) => (dom[key] = ''))

  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((key) => (dom[key] = nextProps[key]))
  //  add
  Object.keys(nextProps)
    .filter(isEvent)
    .filter((key) => isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, nextProps[name])
    })
}
function workLoop(deadline) {
  let shouldYeild = false
  while(nextUnitOfWork && !shouldYeild) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYeild = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }
  requestIdleCallback(workLoop)
}
// 执行任务单元，且返回下一个任务单元
function performUnitOfWork (fiber) {
  // 构建dom树
  if(!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  // diff current fiber wip fiber 树
  const elements = fiber.props.children
  reconcilerChildren(fiber, elements)

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

function reconcilerChildren(wipFiber, elements) {
  let index = 0
  const oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let preSibling = null
  while (index < elements.length || oldFiber != null) {
    const element = elements[index]
    const sameType = oldFiber && element && oldFiber.type === element.type
    let newFiber = null
    if (sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      }
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: null,
        alternate: null,
        effectTag: 'PLACEMENT',
      }
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION'
      deletions.push(oldFiber)
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }
    // generate child fiber, add parent ,sibling
    if (index === 0) {
      wipFiber.child = newFiber
    } else {
      preSibling.sibling = wipFiber
    }
    preSibling = wipFiber
    index++
  }
}
function createDom(fiber) {
  // 1创建dom
  const dom =
    fiber.type == 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type)

  // 添加dom属性

  updateDom(dom, {}, fiber.props)

  return dom
}

function render(element, container) {
  wipRoot = {
    props: {
      children: [element],
    },
    dom: container,
    alternate: currentRoot,
  }
  deletions = []
  nextUnitOfWork = wipRoot
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
const h1 = <h2 className="ddb" onClick={() => alert(2)}>adadada</h2>
// const element = <Counter />
const element = h1
console.log(h1)
const container = document.querySelector('#root')
Didact.render(element, container)
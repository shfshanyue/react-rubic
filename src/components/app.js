import React, { Component, PropTypes } from 'react'

import Cube from './cube'
import { zip, dict, permutation } from '../utils'
import './app.scss'

const LETTERS = 'UDLRFBudlrfbEMSxyz'
const BEFORE_CORRD = [[2, 2], [1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [1, 2]]
const AFTER_CORRD = [[2, 2], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [1, 2], [1, 1], [2, 1]]

const TRANSFORM_CORRD_MAP = dict(zip(BEFORE_CORRD, AFTER_CORRD))
const TRANSFORM_CORRD_R_MAP = dict(zip(AFTER_CORRD, BEFORE_CORRD))

const OPERATIONS = {
  x: {
    1: {
      operate: 'L',
      base: -1
    },
    2: {
      operate: 'M',
      base: -1
    },
    3: {
      operate: 'R',
      base: 1
    }
  },
  y: {
    1: {
      operate: 'U',
      base: -1
    },
    2: {
      operate: 'E',
      base: -1
    },
    3: {
      operate: 'D',
      base: 1
    }
  },
  z: {
    1: {
      operate: 'B',
      base: -1
    },
    2: {
      operate: 'S',
      base: 1
    },
    3: {
      operate: 'F',
      base: 1
    }
  }
}

/* eslint default-case: 0 */
// (1, 1, 1), 'x' ->
const getAxisByRotate = (point, transformAxis) => {
  let info = { x: 'x', y: 'y', z: 'z' }

  if (transformAxis === 'x') {
    const time = point.rotateX / 90
    switch (time % 4) {
      case 1:
      case -3:
        info = { x: 'x', y: 'z-', z: 'y' }
        break
      case 2:
      case -2:
        info = { x: 'x', y: 'y-', z: 'z-' }
        break
      case 3:
      case -1:
        info = { x: 'x', y: 'z', z: 'y-' }
        break
    }
  } else if (transformAxis === 'y') {
    const time = point.rotateY / 90
    switch (time % 4) {
      case 1:
      case -3:
        info = { x: 'z', y: 'y', z: 'x-' }
        break
      case 2:
      case -2:
        info = { x: 'x-', y: 'y', z: 'z-' }
        break
      case 3:
      case -1:
        info = { x: 'z-', y: 'y', z: 'x' }
        break
    }
  } else if (transformAxis === 'z') {
    const time = point.rotateZ / 90
    switch (time % 4) {
      case 1:
      case -3:
        info = { x: 'x', y: 'y', z: 'z' }
        break
      case 2:
      case -2:
        info = { x: 'y-', y: 'x-', z: 'z' }
        break
      case 3:
      case -1:
        info = { x: 'x-', y: 'x-', z: 'z' }
        break
    }
  }
  return info
}


class App extends Component {
  static propTypes = {
    order: PropTypes.number,
    animationEnabled: PropTypes.bool
  };

  constructor() {
    super()
    this.state = {
      ipt: '',
      currentAngle: ''
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentWillMount() {
    const transform = {}
    for (let i=1; i<4; i++) {
      transform[i] = {}
      for (let j=1; j<4; j++) {
        transform[i][j] = {}
        for (let k=1; k<4; k++) {
          transform[i][j][k] = {
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            coord: [i, j, k]
          }
        }
      }
    }
    this.setState({
      transform
    })
  }

  // { currentAngle: L }: (1, 1, 1) -> (1, 1, 3)
  transformByOperation(x, y, z) {
    const { currentAngle } = this.state

    if (currentAngle === '') {
      return { x, y, z }
    }

    const letters = 'LMRUEDBSF'
    const reverse = currentAngle.length === 2 ? -1 : 1
    const angle = currentAngle[0]

    // axisIndex 找到 x,y,z 轴, pos 找到对应的操作
    const index = letters.indexOf(angle)
    const axisIndex = parseInt(index / 3, 10)
    const pos = (index % 3) + 1
    const transformAxis = 'xyz'[axisIndex]

    const map = reverse * OPERATIONS[transformAxis][pos].base === -1 ? TRANSFORM_CORRD_R_MAP : TRANSFORM_CORRD_MAP

    if (axisIndex === 0 && x === pos) {
      [y, z] = map[[y, z].join('')]
    } else if (axisIndex === 1 && y === pos) {
      [x, z] = map[[x, z].join('')]
    } else if (axisIndex === 2 && z === pos) {
      [x, y] = map[[x, y].join('')]
    }
    return { x, y, z, transformAxis }
  }

  rotate(dir) {
    const { transform } = this.state
    const reverse = /'/.test(dir)
    const newDir = reverse ? dir[0] : dir
    const angleBase = reverse ? -1 : 1
    for (let i=1; i<4; i++) {
      for (let j=1; j<4; j++) {
        for (let k=1; k<4; k++) {
          const [i1, j1, k1] = transform[i][j][k].coord
          const { x, y, z, transformAxis } = this.transformByOperation(i1, j1, k1)
          const axisMap = { x, y, z }

          // 对改变的坐标找到对应的操作 ie. U -> F
          const info = getAxisByRotate(transform[i][j][k], transformAxis)

          for (const axis of 'xyz') {
            const { operate, base } = OPERATIONS[axis][axisMap[axis]]
            const transformBase = info[axis].length === 2 ? -1 : 1
            const rotateInc = angleBase * transformBase * base * 90

            if (newDir === operate) {
              transform[i][j][k][`rotate${info[axis][0].toUpperCase()}`] += rotateInc
            }
          }
          transform[i][j][k].coord = [x, y, z]
        }
      }
    }
    this.setState({
      currentAngle: dir,
      transform
    })
  }

  handleChange(event) {
    const value = event.target.value
    const re = new RegExp(`^([${LETTERS}]'?)*$`)
    if (re.test(value)) {
      this.setState({
        ipt: event.target.value
      })
    }
  }

  handleSubmit(event) {
    const re = new RegExp(`[${LETTERS}]'?`, 'g')
    const { ipt } = this.state
    const dirs = ipt.match(re) || []
    const len = dirs.length

    event.preventDefault()
    for (let i=0; i<len; i++) {
      setTimeout(() => {
        this.rotate(dirs[i])
      }, i * 1000)
    }
    this.setState({
      ipt: ''
    })
  }

  renderPieces() {
    const { order, animationEnabled } = this.props
    const { transform } = this.state

    const isEdge = n => n === 1 || n === order

    return Array.from(permutation(order))
      .filter(({ x, y, z }) =>
        (order > 5 ? isEdge(x) || isEdge(y) || isEdge(z) : 1)
      )
      .map(({ x, y, z }) => {
        const { rotateX, rotateY, rotateZ } = transform[x][y][z]

        const style = {
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
          animation: animationEnabled ? false : 'none'
        }

        return (
          <div
            className={`piece-container x-${x} y-${y} z-${z}`}
            key={`${x}-${y}-${z}`}
            style={style}
          >
            <Cube coordinate={{ x, y, z }} level={order} />
          </div>
        )
      })
  }

  render() {
    const { ipt } = this.state
    const { animationEnabled } = this.props

    return (
      <div className="container">
        <div className="cube-container">
          <div
            className="cube"
            id="cube"
            style={{
              animation: animationEnabled ? false : 'none'
            }}
          >
            {
              this.renderPieces()
            }
          </div>
        </div>
        <form className="form" onSubmit={this.handleSubmit}>
          <input type="text" value={ipt} onChange={this.handleChange} />
        </form>
      </div>
    )
  }
}

export default App

import React, { Component, PropTypes } from 'react'

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


class App extends Component {
  static propTypes = {
    order: PropTypes.number,
    animationEnabled: PropTypes.bool
  };

  constructor() {
    super()
    this.state = {
      ipt: '',
      currentAngle: '',
      previousAngle: ''
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
            rotateZ: 0
          }
        }
      }
    }
    this.setState({
      transform
    })
  }

  transformByOperation(x, y, z) {
    const { currentAngle, previousAngle } = this.state

    switch (previousAngle && currentAngle) {
      case 'L':
      case 'R\'':
      case 'M': {
        [y, z] = TRANSFORM_CORRD_MAP[[y, z].join('')]
        break
      }
      case 'L\'':
      case 'R':
      case 'M\'': {
        [y, z] = TRANSFORM_CORRD_R_MAP[[y, z].join('')]
        break
      }
      case 'U':
      case 'E\'':
      case 'D\'': {
        [x, z] = TRANSFORM_CORRD_MAP[[x, z].join('')]
        break
      }
      case 'U\'':
      case 'E':
      case 'D': {
        [x, z] = TRANSFORM_CORRD_R_MAP[[x, z].join('')]
        break
      }
      case 'B':
      case 'F\'':
      case 'S\'': {
        [x, y] = TRANSFORM_CORRD_MAP[[x, y].join('')]
        break
      }
      case 'B\'':
      case 'F':
      case 'S': {
        [x, y] = TRANSFORM_CORRD_R_MAP[[x, y].join('')]
        break
      }
      default:
        break
    }
    return { x, y, z }
  }

  rotate(dir) {
    const { transform } = this.state
    const reverse = /'/.test(dir)
    const newDir = reverse ? dir[0] : dir
    const dirbase = reverse ? -1 : 1

    for (let i=1; i<4; i++) {
      for (let j=1; j<4; j++) {
        for (let k=1; k<4; k++) {
          const axisMap = { X: i, Y: j, Z: k }
          for (const axis of 'XYZ') {
            const rotate = transform[i][j][k][`rotate${axis}`]
            const operate = OPERATIONS[axis.toLowerCase()][axisMap[axis]]
            const rotateInc = operate.base * dirbase * 90

            transform[i][j][k][`rotate${axis}`] = newDir === operate.operate ? (rotate + rotateInc) : rotate
          }
        }
      }
    }
    this.setState(({ currentAngle }) => ({
      currentAngle: dir,
      previousAngle: currentAngle,
      transform
    }))
  }

  handleChange(event) {
    const value = event.target.value
    const re = new RegExp(`^([${LETTERS}]'?)*$`)
    if (re.test(value)) {
      this.setState({
        ipt: event.target.value,
        previousAngle: ''
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

  renderFaces(x, y, z) {
    const { order } = this.props

    const isFirst = n => n === 1
    const isLast = n => n === order

    return (
      <div className={`piece piece-${x}-${y}-${z}`}>
        <div className={`face face-left   ${isFirst(x) ? '' : 'face-inside'}`} />
        <div className={`face face-right  ${isLast(x) ? '' : 'face-inside'}`} />
        <div className={`face face-up     ${isFirst(y) ? '' : 'face-inside'}`} />
        <div className={`face face-down   ${isLast(y) ? '' : 'face-inside'}`} />
        <div className={`face face-back   ${isFirst(z) ? '' : 'face-inside'}`} />
        <div className={`face face-front  ${isLast(z) ? '' : 'face-inside'}`} />
      </div>
    )
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
            { this.renderFaces(x, y, z) }
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

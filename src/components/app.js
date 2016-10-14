import React, { Component, PropTypes } from 'react'

import { zip, dict, permutation } from '../utils'
import './app.scss'

const OPERATIONS = 'UDLRFBudlrfbEMSxyz'
const BEFORE_CORRD = [[2, 2], [1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [1, 2]]
const AFTER_CORRD = [[2, 2], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [1, 2], [1, 1], [2, 1]]

const TRANSFORM_CORRD_MAP = dict(zip(BEFORE_CORRD, AFTER_CORRD))
const TRANSFORM_CORRD_R_MAP = dict(zip(AFTER_CORRD, BEFORE_CORRD))


class App extends Component {
  static propTypes = {
    order: PropTypes.number,
    animationEnabled: PropTypes.bool
  };

  constructor() {
    super()
    this.state = {
      ipt: '',
      angle: {
        U: 0,
        E: 0,
        D: 0,
        L: 0,
        M: 0,
        R: 0,
        F: 0,
        S: 0,
        B: 0
      },
      currentAngle: ''
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  getAngle(x, y, z) {
    const { angle } = this.state
    const { order } = this.props
    let Y = 0
    let Z = 0
    let X = 0
    this.transformByOperation(x, y, z)

    if (x === 1) {
      X = angle.L * 90
    } else if (x === order) {
      X = angle.R * -90
    } else {
      X = angle.M * 90
    }
    if (y === 1) {
      Y = angle.U * -90
    } else if (y === order) {
      Y = angle.D * 90
    } else {
      Y = angle.E * 90
    }
    if (z === 1) {
      Z = angle.B * 90
    } else if (z === order) {
      Z = angle.F * -90
    } else {
      Z = angle.S * -90
    }

    return { X, Y, Z }
  }

  transformByOperation(x, y, z) {
    const { currentAngle } = this.state
    switch (currentAngle) {
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
    const reverse = /'/.test(dir)
    const newDir = reverse ? dir[0] : dir
    this.setState({
      angle: {
        ...this.state.angle,
        [newDir]: this.state.angle[newDir] + (reverse ? -1 : 1)
      },
      currentAngle: dir
    })
  }

  handleChange(event) {
    const value = event.target.value
    const re = new RegExp(`^([${OPERATIONS}]'?)*$`)
    if (re.test(value)) {
      this.setState({
        ipt: event.target.value
      })
    }
  }

  handleSubmit(event) {
    const re = new RegExp(`[${OPERATIONS}]'?`, 'g')
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
        <div className={`face face-up    ${isFirst(y) ? '' : 'face-inside'}`} />
        <div className={`face face-down ${isLast(y) ? '' : 'face-inside'}`} />
        <div className={`face face-back   ${isFirst(z) ? '' : 'face-inside'}`} />
        <div className={`face face-front  ${isLast(z) ? '' : 'face-inside'}`} />
      </div>
    )
  }

  renderPieces() {
    const { order, animationEnabled } = this.props

    const isEdge = n => n === 1 || n === order

    return Array.from(permutation(order))
      .filter(({ x, y, z }) =>
        (order > 5 ? isEdge(x) || isEdge(y) || isEdge(z) : 1)
      )
      .map(({ x, y, z }) => {
        const { X, Y, Z } = this.getAngle(x, y, z)

        const style = {
          transform: `rotateX(${X}deg) rotateY(${Y}deg) rotateZ(${Z}deg)`,
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

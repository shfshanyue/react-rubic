import React, { PropTypes } from 'react'


function Cube({ coordinate: { x, y, z }, level }) {
  return (
    <div className={`piece piece-${x}-${y}-${z}`} style={{'text-align': 'center'}}>
      <div className={`face face-left   ${x === 1 ? '' : 'face-inside'}`} />
      <div className={`face face-right  ${x === level ? '' : 'face-inside'}`} />
      <div className={`face face-up     ${y === 1 ? '' : 'face-inside'}`} />
      <div className={`face face-down   ${y === level ? '' : 'face-inside'}`} />
      <div className={`face face-back   ${z === 1 ? '' : 'face-inside'}`} />
      <div className={`face face-front  ${z === level ? '' : 'face-inside'}`} />
    </div>
  )
}


Cube.propTypes = {
  coordinate: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    z: PropTypes.number.isRequired
  }),
  level: PropTypes.number.isRequired
}


export default Cube

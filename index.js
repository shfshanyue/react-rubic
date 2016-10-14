import React from 'react'
import { render } from 'react-dom'

import App from './src/components/app'

render(
  <App order={3} animationEnabled />,
  document.getElementById('app')
)

export function generatePixelDrawCss (project, frameIndex, type) {
  const frame = project.getIn(['frames', frameIndex])
  const columns = project.get('columns')
  const cellSize = project.get('cellSize')
  const palette = project.get('palette')

  switch (type) {
    case 'array': {
      // Returns frame data as an array
      const frameData = frame.get('pixels').reduce((accumulator, swatchIndex, i) => {
        if (swatchIndex != null) {
          const pixel = palette.getIn([swatchIndex, 'color'])
          const xCoord = ((i % columns) * cellSize) + cellSize
          const yCoord = (parseInt(i / columns, 10) * cellSize) + cellSize
          const pixelInfo = []

          pixelInfo.push(`${xCoord}`)
          pixelInfo.push(`${yCoord}`)
          pixelInfo.push('0')
          pixelInfo.push(pixel)
          accumulator.push(pixelInfo)
        }

        return accumulator
      }, [])
      return frameData
    }
    default: {
      // Returns frame data as CSS string. Value: 'string'
      const cssString = frame.get('pixels').reduce((accumulator, swatchIndex, i) => {
        if (swatchIndex != null) {
          const pixel = palette.getIn([swatchIndex, 'color'])
          const xCoord = ((i % columns) * cellSize) + cellSize
          const yCoord = (parseInt(i / columns, 10) * cellSize) + cellSize

          return `${accumulator} ${xCoord}px ${yCoord}px 0 ${pixel},`
        }

        return accumulator
      }, '')
      return cssString.slice(0, -1)
    }
  }
}

/*
 * Return Animation string to paste in CSS code
 *
   The resultant data will look like:
    .pixel-animation {
      position: absolute;
      animation: x 1s infinite;
      ...
     }
     @keyframes x {
      0%, 25%: { box-shadow: ...}
      25.01%, 50%: { box-shadow: ...}
      50.01%, 75%: { box-shadow: ...}
      75.01%, 100%: { box-shadow: ...}
     }
*/
export function exportAnimationData (keyframes, duration) {
  let result = ''
  result += '.pixel-animation {\n  position: absolute;\n  '

  result += `animation: x ${duration}s infinite;\n  `
  result += `-webkit-animation: x ${duration}s infinite;\n  `
  result += `-moz-animation: x ${duration}s infinite;\n  `
  result += `-o-animation: x ${duration}s infinite;\n}\n\n`

  result += '@keyframes x {\n'

  for (const key in keyframes) {
    if (Object.prototype.hasOwnProperty.call(keyframes, key)) {
      const boxShadow = keyframes[key].boxShadow
      result += `${key}{\n  box-shadow: ${boxShadow}\n  }\n`
    }
  }
  result += '}'

  return result
}

/*
 * Return CSS keyframes data for animation of the frames passed
 *
 * The resultant data will look like:
 * {
 *   0%, 25%: { box-shadow: ...}
 *   25.01%, 50%: { box-shadow: ...}
 *   50.01%, 75%: { box-shadow: ...}
 *   75.01%, 100%: { box-shadow: ...}
 * }
 *
 * for intervalData like: [0, 25, 50, 75, 100]
*/
export function generateAnimationCSSData (project) {
  const frames = project.get('frames')
  const cellSize = project.get('cellSize')
  const intervalData = generateAnimationIntervals(frames)

  const result = frames.reduce((acc, frame, index) => {
    const intervalAcc = acc
    const currentBoxShadow = generatePixelDrawCss(project, index, 'string')
    const minValue = index === 0 ? 0 : intervalData[index] + 0.01
    const maxValue = intervalData[index + 1]
    intervalAcc[`${minValue}%, ${maxValue}%`] =
    { boxShadow:
        `${currentBoxShadow};height: ${cellSize}px; width: ${cellSize}px;`
    }

    return intervalAcc
  }, {})

  return result
}

/*
 * Return the interval data array for animation base on the frames passed
 *
 *  i.e. [0, 25, 50, 75, 100]
 *  i.e. [0, 2.5, 67, 90.3, 100]
*/
export function generateAnimationIntervals (frames) {
  return frames.reduce((acc, frame) => {
    acc.push(parseFloat(frame.get('interval')))
    return acc
  }, [0])
}

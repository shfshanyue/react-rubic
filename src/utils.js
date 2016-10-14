function* permutation(n) {
  for (let x=1; x<=n; x++) {
    for (let y=1; y<=n; y++) {
      for (let z=1; z<=n; z++) {
        yield { x, y, z }
      }
    }
  }
}

function* zip(...lists) {
  let len = 0
  for (const list of lists) {
    len = Math.max(len, list.length)
  }
  const result = []
  for (let i=0; i<len; i++) {
    result[i] = []
    for (const list of lists) {
      result[i].push(list[i])
    }
    yield result[i]
  }
}

function dict(list) {
  const obj = {}
  for (const item of list) {
    if (Array.isArray(item[0])) {
      item[0] = item[0].join('')
    }
    obj[item[0]] = item[1]
  }
  return obj
}

export { permutation, zip, dict }

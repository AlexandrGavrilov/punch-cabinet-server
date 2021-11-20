module.exports = (length = 8) => {
    return Array(length).fill('').map(() => Math.floor(Math.random() * 10) + 1).join('')
}
const person = {
  name: 'Kevan',
  age: 39,
  greet() {
    console.log(`Hi, I am ${this.name}`)
  }
}

const immutablePerson = {...person}
console.log(immutablePerson)

const hobbies = [
  'Sports', 'Cooking'
]

const immutablePattern = [...hobbies, 'Programming']
console.log(immutablePattern)

const toArray = (...args) => args

console.log(toArray(1, 2, 3, 4))
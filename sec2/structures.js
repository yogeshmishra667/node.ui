const person = {
  name: 'Kevan',
  age: 39,
  greet() {
    console.log(`Hi, I am ${this.name}`)
  }
}

const hobbies = [
  'Sports', 'Cooking'
]

for (hobby of hobbies) {
  console.log(hobby)
}

console.log(hobbies.map(hobby => `Hobby: ${hobby}`))
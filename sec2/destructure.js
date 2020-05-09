const person = {
  name: 'Kevan',
  age: 39,
  greet() {
    console.log(`Hi, I am ${this.name}`)
  }
}

const printName = ({ name }) => {
  console.log(name)
}

printName(person)

const { name, age } = person
console.log(`Name: ${name} and age: ${age}`)

const hobbies = [
  'Sports', 'Cooking'
]

const [h1, h2] = hobbies
console.log(h1, h2)
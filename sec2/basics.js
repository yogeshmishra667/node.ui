const name = 'Kevan'
let age = 38
const hasHobbies = true

age = 39

const user = (userName, userAge, userHasHobbies) => 
  `Name is ${userName}, age is ${userAge} and the user has hobbies: ${userHasHobbies}`

console.log(user(name, age, hasHobbies))
const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  console.log(request.headers);
  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(404).json({error: "User Not Found!"});
  }
  
  request.user = user;

  next();
}

function checkExistsTask(request, response, next) {
  const user = request.user;
  console.log(user);

}

app.post('/users', (request, response) => {

  const { name, username } = request.body;

  const userExists = users.find(user => username === user.username);

  if(userExists){
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = { 
    id: uuidv4(),
    name,
    username, 
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
	  created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  var { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find(element => element.id === id);

  if(!todo){
    return response.status(404).json({error: "todo not found"})
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const todo = user.todos.find(element => element.id === id);

  if(!todo){
    return response.status(404).json({error: "error todo"})
  }
  todo.done = true; 

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  
  const todoIndex = user.todos.findIndex(element => element.id === id);
  
  if(todoIndex === -1){
    return response.status(404).json({error: "error todo"})
  }
  
  user.todos.splice(todoIndex, 1);

  console.log("id = ", user);
  
  return response.status(204).send();
});

module.exports = app;
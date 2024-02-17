## Overview

- CRUD Blog app
- Input / output - Rest apis
- Persistance required - MongoDB
- Frontend Required

## Requirements Gathering

- User can register/login on the app (Done)
- User will have username, email, password, profile picture (Done)
- Only registered user can posts the blog (Done)
- Not registered users can see the blog (Done)
- Blog will have heading, body, posted_date, author (Done)
- User can create new blog as well as edit the blog (Done)
- There will be blog details page to read the blog (Done)
- User profile page to user information
- Validations required on input data
- Error handling required (Done)

## Schema design

User

- id (int) (Pk)
- username (String)
- email (String)
- password (encrypted string)
- profile_picture

Blog

- id (int) (Pk)
- heading (String)
- body (String)
- author (Fk: User) (Index)

## Rest apis

#### Auth (api/v1/auth)

Sign up

- /register

Login

- /login

Get User Profile

- /profile

#### Blogs (api/v1/blogs)

Get All Blogs

- /all

Get LoggedIn User's Blogs

- /

Get Blog by Id

- /:id

Update Blog by Id

- /:id

Delete Blog by Id

- /:id

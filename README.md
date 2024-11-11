# blog-api: BlogForge

Basically, my desired page will be like:
1. A welcome page that advertises BlogForge
2. If the user is logged in, it will display a sidebar that contains
  a. Home Tab - displays all posts of all registered users.
  b. Inbox tab - displays all notification of followed profiles when they posted
  c. Add New Post - A button that allows the user to add a new post, opening a page
  d. A profile drop down - It itself contains list entries such as settings and signout and edit.

3. Home Tab. Home tab will be cards that displays user posts. Users can click on it to open the entire post

4. Inbox tab.

5. Add New Post. Opens a new page for editing a new post. It has a title, tags, and the post itself. I wonder how can
I make the user edit the paragraph styles, text styles, etc? We will figure this out!

6. Profile Drop Down. 

TODOs
- [X] Blog API Draft/Beginnigns
  - [X] Get Blog posts from all users
  - [X] Get user profile and posts from that user.
  - [X] JWT Authentication
  - [X] STORE USER DB
  - [X] Allow Sign-in users to create posts. Request Tokens in DB.
  - [X] Remove password as input in token signing
  - [X] Separate files into controllers and routes to satisfy clean code people
  - [X] Ability To Display Posts
  - [X] Ability To Craete posts
  - [X] Return profile of user that contains all of published posts, profile, etc.
  - [X] Remove mock database

- [ ] Begin Front End Design
  - Resources:
    1. https://react.dev/learn
    2. https://reactrouter.com/en/main/start/tutorial
    3. https://www.theodinproject.com/lessons/node-path-react-new-react-router
    4. https://expressjs.com/en/resources/middleware/cors.html,
    5. https://www.theodinproject.com/lessons/nodejs-api-basics, 
    6. https://reactrouter.com/en/main/components/navigate

  - [ ] Welcome Page for nonregistered users.
    - [X] Feature list completion.
      - [X] A button per feature that says create your own blog.
    - [X] Sign Up Page
    - [X] https://reactrouter.com/en/main/start/tutorial
        - route nesting! Basically, main homepage as outlet and signup page as outlet, etc!
    - [X] Sign In page

    - [ ] Working Sign Up Page! Remember CORS?

    - [ ] Working Sign In Page!
  
- [ ] An applicaton when user is signed-in (actual dashboard stuff)
  - [ ] Remember that the sidebar contains the things mentioned above!
  - [ ] Ability To Update Bio (BACKEND)

- [ ] After basic dashboard posts, go back to homepage and implement 'see user posts' thingy

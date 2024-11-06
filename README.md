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
- [ ] Blog API Draft/Beginnigns
  - [X] Get Blog posts from all users
  - [X] Get user profile and posts from that user.
  - [X] JWT Authentication
  - [X] STORE USER DB
  - [X] Allow Sign-in users to create posts. Request Tokens in DB.
  - [X] Remove password as input in token signing
  - [ ] Separate files into controllers and routes to satisfy clean code people
  - [ ] Return profile of user that contains all of published posts, profile, etc.
  - [ ] Remove mock database

- [ ] Begin Front End Design
  - [ ] Remember that the sidebar contains the things mentioned above!

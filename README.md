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

    - [X] Working Sign Up Page! Remember CORS?

    - [X] Working Sign In Page! 
      - Ok, so I should somehow know how to do authentication using react-router-dom... I also need to rearrange my routes like different appearance for users who arent signed in, etc.
      - There is also something called refresh token, and I need to make that thing secure as possible. Internet says something about httpOnly, and some crazy terms that IDK about.
      - What about having sing-up, sign-in, and homepage have their own pages instead of separating them?
      - [X] How can we make JWT Tokens persist?
        - https://blog.logrocket.com/jwt-authentication-best-practices/
        - https://hasura.io/blog/best-practices-of-using-jwt-with-graphql
        - https://blog.logrocket.com/authentication-react-router-v6/
      - [X] If the user is signed in, we should prevent them from going to signup / signin
        and instead redirect them to the Dashboard page! This implies developing the dashboard (dummy) first
      - [X] Conditionally rendering NavBar/Homepage stuff if not signed in! 
      - [ ] Cookie Parser and JWT.
        - https://dev.to/franciscomendes10866/using-cookies-with-jwt-in-node-js-8fn
        - https://www.youtube.com/watch?v=eJ3YysWaP_A&t=582s
        - https://www.npmjs.com/package/cookie-parser
        - https://medium.com/@techsuneel99/jwt-authentication-in-nodejs-refresh-jwt-with-cookie-based-token-37348ff685bf
        - https://dev.to/franciscomendes10866/using-cookies-with-jwt-in-node-js-8fn
        - [X] fix signup and signin redirection when authed.
        - [X] form data instead of useState of fields
  
- [ ] An applicaton when user is signed-in (actual dashboard stuff)
  - [ ] Complete Sidebar.
    - [X] Sidebar Icons. How can we colour them?
    - [X] QUick Profile For Debug Signout!
    - [X] Do Posts. Fetch Them. Display them. Or create dummy posts. For Now.
    - [X] React Props Types!
    - [X] Post UI: https://shop.entheosweb.com/ui-elements-type/161382.html
        - instead of grid, why not a single column and n rows? Display some sort of picture, little details, post title, and "read more" link...
    - [X] How to edtend sidebar, content below the page?
    
    - [ ] Add likes, comments count per post!
        - [ ] Display The COmments!
          - [ ] Add likes/dislikes in comments!
          - [ ] Likes/dislikes icons!
        - [ ] Actual Add Comment Functionality
        - [ ] Date is used multiple times. Pullout into a fucntion!
        - [ ] Major cleanup before next feature!
    - [ ] Design Add Posts! Make it nice!
    - [ ] Tags Per Post
    - [ ] Add Views per post
    - [ ] Problem: When reloading, we redirect back to /home for some reason.

  - [ ] Ability To Update Bio (BACKEND)

- [ ] After basic dashboard posts, go back to homepage and implement 'see user posts' thingyi

# YelpCamp
——— Camping Web application based on Node.js and mongoDB Atlas

## Summary
YelpCamp is a web application **sharing Campgrounds** with people all-over the world, which is developed using **Node.js** and **mongoDB**. Every one can **register**, **login** and **upload**, **Edit**, **Delete** campgrouds with name, image, location and description; **Comments and Likes** can be added to the campgrounds; related **Weather**, **Address**, **Temperature** and **Map** are displayed on each campground page; **Fuzzy Search** was implemented.

## Stacks and Features
* Developed RESTFul routers based on **Node.js**;
* Designed Database Schema based on three models: **Campground, Comment and User**
* Implemented “add, edit, delete, show, like” oprations of **Campgrounds** and **Comments**;
* **Express.js** Structure;
* Used **MongoDB** as Database, **MongoDB Atlas** was ingrained;
* Used **Flash** to implement in-application **notification**
* Used **Cloundinary** cloud-based services to store images and **Multer** package to upload image files;
* Embedded **Google Map** in the campground page based on **Google Map API**, such as geocoder;
* Embedded campground local current **Weather** description and **Temperature** based on **OpenWeather API**;
* Implemented **Fuzzy Search** based on **regular expressions**;
* Used **Moment** to obtain the relative period from created time;
* Used **jQuery** to implemented pop-up window of **Likes**
* Styled based on **Bootstrap** and **FontAwesome**;
* Frontend developmented using **ejs**;

## Demo
Deploy on Heroku: https://powerful-harbor-90189.herokuapp.com/

![image](https://github.com/SKZhao97/Frontend_study/blob/master/images/campgrounds.png)
![image](https://github.com/SKZhao97/Frontend_study/blob/master/images/show.png)
![image](https://github.com/SKZhao97/Frontend_study/blob/master/images/commentsandlikes.png)
![image](https://github.com/SKZhao97/Frontend_study/blob/master/images/update%20flash.png)
![image](https://github.com/SKZhao97/Frontend_study/blob/master/images/FuzzySearch.png)
![image](https://github.com/SKZhao97/Frontend_study/blob/master/images/add.png)
![image](https://github.com/SKZhao97/Frontend_study/blob/master/images/login.png)
![image](https://github.com/SKZhao97/Frontend_study/blob/master/images/signup.png)

